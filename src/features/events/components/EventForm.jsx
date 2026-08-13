// src/features/events/components/EventForm.jsx
// Wizard de criar/editar eventos — 4 passos (edição atual) ou 2 (edição
// passada), conforme isCurrent (ver FULL_STEPS/REDUCED_STEPS abaixo).

import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import toast from 'react-hot-toast';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import { eventSchema, STEP_FIELDS } from '../schemas/eventSchema.js';
import {
  useSaveEvent,
  useSetCurrentEvent,
  useClearCurrentEvent,
} from '../../../hooks/useEvents.js';
import { newEventId } from '../../../services/events.js';
import { DEFAULT_EVENT_COLORS } from '../constants/defaultPalette.js';
import { useCollaborators } from '../../../hooks/useCollaborators.js';
import { useProgrammings } from '../../../hooks/useProgrammings.js';
import EventStep1 from './steps/EventStep1.jsx';
import EventStep2 from './steps/EventStep2.jsx';
import EventStep3 from './steps/EventStep3.jsx';
import EventStep4 from './steps/EventStep4.jsx';
import EventStep5 from './steps/EventStep5.jsx';
import DiscardChangesModal from '../../../components/ui/DiscardChangesModal.jsx';
import { useDiscardGuard } from '../../../hooks/useDiscardGuard.js';

// Wizard completo: edição atual (isCurrent: true) — só os passos 1 a 4. O
// Passo 5 (Conteúdo de Arquivo) é exclusivo do wizard reduzido: uma edição
// atual não tem "arquivo" ainda, então esse passo nem existe aqui, nem como
// item navegável nem como conteúdo acessível por outra via.
const FULL_STEPS = [
  { number: 1, label: 'Identidade', id: 'step1' },
  { number: 2, label: 'Modalidade', id: 'step2' },
  { number: 3, label: 'Apresentação', id: 'step3' },
  { number: 4, label: 'Pessoas', id: 'step4' },
];

// Wizard reduzido: edição passada (isCurrent: false) — só banner (sem CTA) e
// conteúdo de arquivo. Os passos 2-4 do wizard completo ficam de fora: os
// dados que já tinham sido preenchidos neles continuam salvos no Firestore,
// só deixam de ser editáveis por aqui enquanto isCurrent for false.
const REDUCED_STEPS = [
  { number: 1, label: 'Banner', id: 'step1Reduced' },
  { number: 2, label: 'Conteúdo de arquivo', id: 'step5Archive' },
];

const AUTOSAVE_INTERVAL_MS = 30000; // 30 segundos

/** Campos do passo `stepNumber` do array de passos ativo. */
function fieldsOfStep(steps, stepNumber) {
  const { id } = steps[stepNumber - 1];
  return STEP_FIELDS[id] ?? [];
}

export default function EventForm({ initialData, isEditMode = false, onSuccess }) {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [visitedSteps, setVisitedSteps] = useState([1]);

  // Instâncias separadas: o rascunho automático e o botão manual não devem
  // marcar o submit final (nem um ao outro) como pendente.
  const saveMutation = useSaveEvent();
  const draftMutation = useSaveEvent();
  const manualSaveMutation = useSaveEvent();
  const setCurrentMutation = useSetCurrentEvent();
  const clearCurrentMutation = useClearCurrentEvent();
  const { data: speakers = [] } = useCollaborators();
  const { data: programmings = [] } = useProgrammings();

  const speakersData = speakers.filter((c) => c.type === 'speaker');
  const curatorsData = speakers.filter((c) => c.type === 'scientific_curator');

  // Mesclado, não `initialData || {...}`: um evento salvo antes de um campo
  // opcional existir (ex.: bannerOrder) não tem essa chave no Firestore, e
  // com `||` o fallback inteiro seria descartado — o campo nasceria
  // undefined em vez de null, e undefined nunca sobrevive a um setDoc() (ver
  // sanitizeWrite em services/events.js, que hoje protege o payload mas não
  // evita o valor errado de nascer aqui). Com spread, cada chave ausente em
  // initialData cai no default seguro; o que existe em initialData vence.
  const DEFAULT_VALUES = {
    headline: '',
    editionNumber: null,
    subtitle: '',
    // '' e não null: o schema espera string e o input é controlado.
    bannerDesktopUrl: '',
    bannerTabletUrl: '',
    bannerMobileUrl: '',
    bannerOrder: null,
    cta: '',
    ctaLink: '',
    // null, não '': igual a bannerOrder — string vazia falharia o regex de
    // hex do schema se algum código tentasse validar antes do usuário
    // escolher uma cor. null = "sem cor customizada" (ColorPicker.jsx).
    ctaButtonBg: null,
    ctaButtonText: null,
    separatorColor: null,
    // null = sem local definido — ver LocationPickerModal.jsx/EventStep2.jsx.
    location: null,
    modality: 'hybrid',
    priceInPerson: null,
    priceOnline: null,
    presentation: [
      { icon: '', title: '', description: '' },
      { icon: '', title: '', description: '' },
      { icon: '', title: '', description: '' },
    ],
    speakers: [],
    starSpeakerIds: [],
    organizerIds: [],
    curatorIds: [],
    // '' e não null: <select> controlado com null dispara warning do React.
    programming: '',
    sponsors: [],
    testimonials: [],
    videos: [],
    gallery: [],
    archiveTitle: '',
    archiveSubtitle: '',
    archiveStats: [
      { prefix: '', value: '', suffix: '', title: '', description: '' },
      { prefix: '', value: '', suffix: '', title: '', description: '' },
      { prefix: '', value: '', suffix: '', title: '', description: '' },
    ],
    // O schema valida /^#[0-9A-F]{6}$/i — var(--token) nunca passaria.
    colors: { ...DEFAULT_EVENT_COLORS },
    isCurrent: false,
  };

  const {
    register,
    control,
    watch,
    trigger,
    getValues,
    handleSubmit,
    formState: { errors, isSubmitting, isDirty },
  } = useForm({
    resolver: zodResolver(eventSchema),
    defaultValues: { ...DEFAULT_VALUES, ...initialData },
  });

  // A estrutura do wizard reage ao isCurrent DESTE evento em tempo real, não
  // só no carregamento: marcar/desmarcar o checkbox do passo 1 troca o
  // conjunto de passos imediatamente, sem precisar salvar e reabrir — mesmo
  // padrão de reatividade já usado no projeto para outros campos derivados
  // (ver watch() no restante deste arquivo).
  const isCurrentValue = watch('isCurrent');
  const STEPS = isCurrentValue ? FULL_STEPS : REDUCED_STEPS;

  // Se o número de passos encolhe (edição atual → passada) enquanto o
  // usuário está num passo que deixou de existir, recua pro último passo
  // válido do wizard reduzido em vez de deixar a tela em branco.
  useEffect(() => {
    setCurrentStep((prev) => Math.min(prev, STEPS.length));
    setVisitedSteps((prev) => prev.filter((step) => step <= STEPS.length));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isCurrentValue]);

  // ID do documento: o existente em edição, ou um novo sorteado já na montagem.
  //
  // Antes era preenchido só no primeiro rascunho, mas o upload dos banners
  // (passo 1) monta o caminho no Storage com este id e pode acontecer antes
  // de qualquer salvamento. Gerar o id não grava nada no Firestore — é só um
  // identificador reservado — então antecipá-lo não cria documento fantasma.
  const draftIdRef = useRef(initialData?.id ?? newEventId());

  // Cancelar aparece em todos os passos e descarta o wizard inteiro, não só o
  // passo atual — isDirty cobre os cinco passos porque todos escrevem no mesmo
  // formulário do React Hook Form.
  const discard = useDiscardGuard({
    isDirty,
    onLeave: () => navigate('/painel/eventos'),
  });

  // Padrão "latest ref": o intervalo é criado uma única vez (deps []), mas sempre
  // executa a versão mais recente do salvamento, sem fechar sobre dados obsoletos.
  const saveDraftRef = useRef(null);
  useEffect(() => {
    saveDraftRef.current = async () => {
      const values = getValues();
      // Sem headline não há rascunho que valha a pena persistir.
      if (!values.headline?.trim()) return;
      if (!draftIdRef.current) draftIdRef.current = newEventId();

      try {
        await draftMutation.mutateAsync({ id: draftIdRef.current, data: values });
      } catch (error) {
        console.error('Falha no rascunho automático:', error);
      }
    };
  });

  useEffect(() => {
    const timer = setInterval(() => saveDraftRef.current?.(), AUTOSAVE_INTERVAL_MS);
    return () => clearInterval(timer);
  }, []);

  async function onSubmit(data) {
    try {
      if (!draftIdRef.current) draftIdRef.current = newEventId();

      await saveMutation.mutateAsync({
        id: draftIdRef.current,
        data: { ...data, status: 'published' },
      });

      // Passo separado de propósito: saveEvent ignora isCurrent, porque a
      // troca do evento em destaque envolve dois documentos e só é atômica
      // dentro de setCurrentEvent. Se já era o atual, não há o que fazer.
      if (data.isCurrent && !initialData?.isCurrent) {
        await setCurrentMutation.mutateAsync(draftIdRef.current);
      } else if (!data.isCurrent && initialData?.isCurrent) {
        // Desmarcado no formulário: a plataforma fica sem evento atual, que é
        // o mesmo estado de antes de alguém eleger o primeiro.
        await clearCurrentMutation.mutateAsync(draftIdRef.current);
      }

      toast.success(isEditMode ? 'Edição atualizada e publicada!' : 'Edição criada e publicada!');
      navigate('/painel/eventos');
      onSuccess?.();
    } catch (error) {
      console.error('Erro ao salvar edição:', error);
      toast.error(error.message || 'Erro ao salvar edição');
    }
  }

  // Rede de segurança: se a validação final falhar, leva o usuário ao primeiro
  // passo com erro em vez de falhar silenciosamente no passo 5.
  function onInvalid(formErrors) {
    const errorKeys = Object.keys(formErrors);
    const stepWithError = STEPS.find((step) =>
      fieldsOfStep(STEPS, step.number).some((field) => errorKeys.includes(field)),
    );

    if (stepWithError) {
      setCurrentStep(stepWithError.number);
      setVisitedSteps((prev) =>
        prev.includes(stepWithError.number) ? prev : [...prev, stepWithError.number],
      );
    }
    toast.error('Revise os campos destacados antes de publicar.');
  }

  async function handleNextStep() {
    if (currentStep >= STEPS.length) return;

    // Valida apenas os campos do passo atual, conforme STEP_FIELDS.
    const isStepValid = await trigger(fieldsOfStep(STEPS, currentStep));
    if (!isStepValid) {
      toast.error('Revise os campos destacados antes de avançar.');
      return;
    }

    const nextStep = currentStep + 1;
    setCurrentStep(nextStep);
    if (!visitedSteps.includes(nextStep)) {
      setVisitedSteps([...visitedSteps, nextStep]);
    }
  }

  function handlePrevStep() {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  }

  // Salva o estado atual sem exigir o passo 4/5 nem forçar 'published' —
  // mesma gravação do rascunho automático, só que sob controle do usuário e
  // com feedback (toast, loading). Não valida: um evento em progresso pode
  // ter passos futuros incompletos, e travar o salvamento nisso frustraria
  // justamente quem quer salvar e continuar depois.
  //
  // Pós-salvamento igual ao submit final (toast + volta pra listagem): só a
  // MENSAGEM E O REDIRECIONAMENTO são espelhados, não a troca atômica de
  // isCurrent nem o `status: 'published'` de onSubmit — aqueles continuam
  // exclusivos do submit completo, que exige o wizard inteiro válido.
  async function handleManualSave() {
    const values = getValues();
    if (!draftIdRef.current) draftIdRef.current = newEventId();

    try {
      await manualSaveMutation.mutateAsync({ id: draftIdRef.current, data: values });
      toast.success(isEditMode ? 'Alterações salvas com sucesso!' : 'Rascunho salvo com sucesso!');
      navigate('/painel/eventos');
      onSuccess?.();
    } catch (error) {
      console.error('Erro ao salvar alterações:', error);
      toast.error(error.message || 'Erro ao salvar alterações');
    }
  }

  // Navegação livre: qualquer número de passo leva direto a ele. Antes só ia
  // a passos já visitados — sem sentido agora que "Salvar alterações" permite
  // guardar o progresso a qualquer momento, sem depender de avançar em ordem.
  function goToStep(step) {
    setCurrentStep(step);
    if (!visitedSteps.includes(step)) {
      setVisitedSteps((prev) => [...prev, step]);
    }
  }

  return (
    <>
      <form onSubmit={handleSubmit(onSubmit, onInvalid)} className="sd-form--panel">
      {/* ── Progress steps ── */}
      <div className="sda-steps" style={{ marginBottom: 'var(--space-8)' }}>
        {STEPS.map((step) => {
          const isCurrent = currentStep === step.number;
          const isDone = visitedSteps.includes(step.number) && !isCurrent;

          return (
            <button
              key={step.id}
              type="button"
              className={`sda-steps__step ${isCurrent ? 'sda-steps__step--current' : ''} ${
                isDone ? 'sda-steps__step--done' : ''
              }`}
              onClick={() => goToStep(step.number)}
            >
              <span className="sda-steps__number">
                {isDone ? '✓' : step.number}
              </span>
              <span className="sda-steps__label">
                {step.number} · {step.label}
              </span>
            </button>
          );
        })}
      </div>

      {/* ── Steps content ──
          isCurrentValue decide a forma do wizard: atual (4 passos) ou
          passada (2 passos — banner sem CTA + conteúdo de arquivo). O Passo
          5 (EventStep5) só existe no modo reduzido, como passo 2. */}
      <div style={{ minHeight: '400px', marginBottom: 'var(--space-8)' }}>
        {currentStep === 1 && (
          <EventStep1
            register={register}
            control={control}
            errors={errors}
            watch={watch}
            eventId={draftIdRef.current}
            hideCta={!isCurrentValue}
          />
        )}
        {isCurrentValue && currentStep === 2 && (
          <EventStep2 register={register} control={control} errors={errors} watch={watch} />
        )}
        {isCurrentValue && currentStep === 3 && (
          <EventStep3 register={register} errors={errors} watch={watch} />
        )}
        {isCurrentValue && currentStep === 4 && (
          <EventStep4
            control={control}
            errors={errors}
            speakers={speakersData}
            curators={curatorsData}
            programmings={programmings}
            watch={watch}
          />
        )}
        {!isCurrentValue && currentStep === 2 && (
          <EventStep5
            register={register}
            control={control}
            errors={errors}
            watch={watch}
            eventId={draftIdRef.current}
          />
        )}
      </div>

      {/* ── Footer com navegação ── */}
      <div
        className="sda-wizard-footer"
        style={{
          display: 'flex',
          gap: 'var(--space-3)',
          justifyContent: 'space-between',
          paddingTop: 'var(--space-4)',
          borderTop: '1px solid var(--border)',
          position: 'sticky',
          bottom: 0,
          backgroundColor: 'white',
          zIndex: 10,
        }}
      >
        <div className="sda-wizard-footer__group" style={{ display: 'flex', gap: 'var(--space-3)' }}>
          <button
            type="button"
            className="sd-btn sd-btn--ghost"
            onClick={discard.requestLeave}
          >
            <X size={16} aria-hidden="true" />
            Cancelar
          </button>

          <button
            type="button"
            className="sd-btn sd-btn--outline"
            onClick={handlePrevStep}
            disabled={currentStep === 1}
          >
            <ChevronLeft size={16} aria-hidden="true" />
            Voltar
          </button>
        </div>

        <div className="sda-wizard-footer__group" style={{ display: 'flex', gap: 'var(--space-3)' }}>
          <button
            type="button"
            className="sd-btn sd-btn--outline"
            onClick={handleManualSave}
            disabled={manualSaveMutation.isPending}
          >
            {manualSaveMutation.isPending
              ? 'Salvando…'
              : isEditMode ? 'Salvar alterações' : 'Salvar rascunho'}
          </button>

          {currentStep < STEPS.length ? (
            <button
              type="button"
              className="sd-btn sd-btn--primary"
              onClick={handleNextStep}
            >
              Avançar
              <ChevronRight size={16} aria-hidden="true" />
            </button>
          ) : (
            <button
              type="submit"
              className="sd-btn sd-btn--primary"
              disabled={isSubmitting || saveMutation.isPending}
            >
              {isEditMode ? 'Atualizar' : 'Publicar'} Edição
            </button>
          )}
        </div>
      </div>
    </form>

      {/* ── Descartar alterações ── */}
      {discard.isConfirmOpen && (
        <DiscardChangesModal
          onCancel={discard.cancelLeave}
          onConfirm={discard.confirmLeave}
        />
      )}
    </>
  );
}

// src/features/events/components/EventForm.jsx
// Wizard de 5 passos para criar/editar eventos

import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import toast from 'react-hot-toast';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import { eventSchema, eventStepSchema } from '../schemas/eventSchema.js';
import {
  useSaveEvent,
  useSetCurrentEvent,
  useClearCurrentEvent,
} from '../../../hooks/useEvents.js';
import { newEventId } from '../../../services/events.js';
import { DEFAULT_EVENT_COLORS } from '../constants/defaultPalette.js';
import { useCollaborators } from '../../../hooks/useCollaborators.js';
import { useProgrammings } from '../../../hooks/useProgrammings.js';
import { useSponsors } from '../../../hooks/useSponsors.js';
import EventStep1 from './steps/EventStep1.jsx';
import EventStep2 from './steps/EventStep2.jsx';
import EventStep3 from './steps/EventStep3.jsx';
import EventStep4 from './steps/EventStep4.jsx';
import EventStep5 from './steps/EventStep5.jsx';
import DiscardChangesModal from '../../../components/ui/DiscardChangesModal.jsx';
import { useDiscardGuard } from '../../../hooks/useDiscardGuard.js';

const STEPS = [
  { number: 1, label: 'Identidade', id: 'step1' },
  { number: 2, label: 'Modalidade', id: 'step2' },
  { number: 3, label: 'Apresentação', id: 'step3' },
  { number: 4, label: 'Pessoas', id: 'step4' },
  { number: 5, label: 'Visual', id: 'step5' },
];

const AUTOSAVE_INTERVAL_MS = 30000; // 30 segundos

/** Campos de cada passo, derivados do próprio eventStepSchema. */
function fieldsOfStep(stepNumber) {
  const { id } = STEPS[stepNumber - 1];
  return Object.keys(eventStepSchema[id].shape);
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
  const { data: sponsors = [] } = useSponsors();

  const speakersData = speakers.filter((c) => c.type === 'speaker');
  const organizersData = speakers.filter((c) => c.type === 'organizer');
  const curatorsData = speakers.filter((c) => c.type === 'scientific_curator');

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
    defaultValues: initialData || {
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
      // O schema valida /^#[0-9A-F]{6}$/i — var(--token) nunca passaria.
      colors: { ...DEFAULT_EVENT_COLORS },
      isCurrent: false,
    },
  });

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

      toast.success(isEditMode ? 'Evento atualizado e publicado!' : 'Evento criado e publicado!');
      navigate('/painel/eventos');
      onSuccess?.();
    } catch (error) {
      console.error('Erro ao salvar evento:', error);
      toast.error(error.message || 'Erro ao salvar evento');
    }
  }

  // Rede de segurança: se a validação final falhar, leva o usuário ao primeiro
  // passo com erro em vez de falhar silenciosamente no passo 5.
  function onInvalid(formErrors) {
    const errorKeys = Object.keys(formErrors);
    const stepWithError = STEPS.find((step) =>
      fieldsOfStep(step.number).some((field) => errorKeys.includes(field)),
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

    // Valida apenas os campos do passo atual, conforme eventStepSchema.
    const isStepValid = await trigger(fieldsOfStep(currentStep));
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

  // Salva o estado atual sem exigir o passo 5 nem forçar 'published' — mesma
  // gravação do rascunho automático, só que sob controle do usuário e com
  // feedback (toast, loading). Não valida: um evento em progresso pode ter
  // passos futuros incompletos, e travar o salvamento nisso frustraria
  // justamente quem quer salvar e continuar depois.
  async function handleManualSave() {
    const values = getValues();
    if (!draftIdRef.current) draftIdRef.current = newEventId();

    try {
      await manualSaveMutation.mutateAsync({ id: draftIdRef.current, data: values });
      toast.success(isEditMode ? 'Alterações salvas com sucesso!' : 'Rascunho salvo com sucesso!');
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

      {/* ── Steps content ── */}
      <div style={{ minHeight: '400px', marginBottom: 'var(--space-8)' }}>
        {currentStep === 1 && (
          <EventStep1
            register={register}
            control={control}
            errors={errors}
            eventId={draftIdRef.current}
          />
        )}
        {currentStep === 2 && (
          <EventStep2 register={register} control={control} errors={errors} watch={watch} />
        )}
        {currentStep === 3 && (
          <EventStep3 register={register} errors={errors} watch={watch} />
        )}
        {currentStep === 4 && (
          <EventStep4
            control={control}
            errors={errors}
            speakers={speakersData}
            organizers={organizersData}
            curators={curatorsData}
            programmings={programmings}
            sponsors={sponsors}
            watch={watch}
          />
        )}
        {currentStep === 5 && (
          <EventStep5 register={register} control={control} errors={errors} watch={watch} />
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
              {isEditMode ? 'Atualizar' : 'Publicar'} Evento
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

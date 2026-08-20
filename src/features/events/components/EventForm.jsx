// src/features/events/components/EventForm.jsx
// Wizard de criar/editar eventos — 5 passos (edição atual) ou 3 (edição
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
import { VIDEO_TYPES } from '../../../utils/contentBlocks.js';
import { useCollaborators } from '../../../hooks/useCollaborators.js';
import { useProgrammings } from '../../../hooks/useProgrammings.js';
import EventStep1 from './steps/EventStep1.jsx';
import EventStep2 from './steps/EventStep2.jsx';
import EventStep3 from './steps/EventStep3.jsx';
import EventStep4 from './steps/EventStep4.jsx';
import EventStep5 from './steps/EventStep5.jsx';
import EventStepVideo from './steps/EventStepVideo.jsx';
import DiscardChangesModal from '../../../components/ui/DiscardChangesModal.jsx';
import { useDiscardGuard } from '../../../hooks/useDiscardGuard.js';

// Wizard completo: edição atual (isCurrent: true) — passos 1 a 5. O
// "Conteúdo de Arquivo" (EventStep5.jsx) continua exclusivo do wizard
// reduzido: uma edição atual não tem "arquivo" ainda, então esse passo não
// existe aqui, nem como item navegável nem por outra via. O Passo 5 desta
// lista é OUTRA coisa — a seção de vídeo (EventStepVideo.jsx), que existe
// nos dois fluxos.
const FULL_STEPS = [
  { number: 1, label: 'Identidade', id: 'step1' },
  { number: 2, label: 'Modalidade', id: 'step2' },
  { number: 3, label: 'Apresentação', id: 'step3' },
  { number: 4, label: 'Pessoas', id: 'step4' },
  { number: 5, label: 'Vídeo', id: 'stepVideo' },
];

// Wizard reduzido: edição passada (isCurrent: false) — só banner (sem CTA) e
// conteúdo de arquivo. Os passos 2-4 do wizard completo ficam de fora: os
// dados que já tinham sido preenchidos neles continuam salvos no Firestore,
// só deixam de ser editáveis por aqui enquanto isCurrent for false.
//
// O bloco de texto corrido opcional (textBlock) vale igualmente para os
// dois fluxos, mas NÃO ganha passo próprio: entra no Passo 3 do completo e
// no Passo 2 daqui, pelo mesmo TextBlockFields.jsx.
//
// A seção de vídeo (videoBlock) é o caso oposto e deliberado: também vale
// para os dois fluxos, mas TEM passo próprio — o último dos dois, aqui
// como Passo 3 e no completo como Passo 5, pelo mesmo EventStepVideo.jsx.
const REDUCED_STEPS = [
  { number: 1, label: 'Banner', id: 'step1Reduced' },
  { number: 2, label: 'Conteúdo de arquivo', id: 'step5Archive' },
  { number: 3, label: 'Vídeo', id: 'stepVideo' },
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
  // Upload de vídeo em andamento (passo de vídeo). Trava publicar/salvar
  // enquanto o arquivo sobe: gravar agora salvaria a edição apontando pra
  // uma URL que ainda não existe, e sair da página aborta o envio.
  const [isVideoUploading, setIsVideoUploading] = useState(false);

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
    // false, nunca undefined: o banner da edição só vai pro carrossel da
    // Home se o admin marcar (ver EventStep1.jsx/HomeHero.jsx).
    showBannerOnHome: false,
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
    // '' e não null: inputs controlados. Vazio = usa o texto padrão.
    presentationTitle: '',
    presentationSubtitle: '',
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
    // Bloco de texto corrido opcional: objeto vazio, não null. No Firestore
    // ele é null quando a edição não o tem (ver services/events.js), e um
    // null aqui deixaria os inputs sem valor inicial — o React reclamaria
    // da troca de não-controlado pra controlado na 1ª digitação.
    textBlock: { title: '', body: '' },
    // Mesmo motivo do textBlock acima: objeto vazio e não null, para os
    // inputs do Passo de vídeo nascerem controlados. `subtitle` é '' aqui
    // (e null no Firestore) — o input é uma string, o documento não.
    videoBlock: {
      title: '',
      subtitle: '',
      // 'url' é o padrão: não hospeda nada, não custa banda do Blaze.
      videoType: VIDEO_TYPES.URL,
      videoUrl: '',
      videoStoragePath: null,
    },
    isCurrent: false,
  };

  // Mesmo motivo do comentário acima: o spread raso de initialData traria
  // `textBlock: null` inteiro por cima do default. Ele volta ao objeto
  // vazio quando vem null/ausente, preservando o que existir.
  const initialValues = {
    ...DEFAULT_VALUES,
    ...initialData,
    textBlock: { ...DEFAULT_VALUES.textBlock, ...(initialData?.textBlock ?? {}) },
    videoBlock: {
      ...DEFAULT_VALUES.videoBlock,
      ...(initialData?.videoBlock ?? {}),
      // O subtítulo é null no Firestore quando vazio; o spread acima
      // traria esse null para o input, que voltaria a ser não-controlado.
      subtitle: initialData?.videoBlock?.subtitle ?? '',
      // Bloco salvo antes de videoType existir só podia ser link — mesmo
      // fallback de normalizeVideoBlock, pro formulário abrir na aba certa.
      videoType: initialData?.videoBlock?.videoType ?? VIDEO_TYPES.URL,
    },
  };

  const {
    register,
    control,
    watch,
    trigger,
    setValue,
    getValues,
    handleSubmit,
    formState: { errors, isSubmitting, isDirty },
  } = useForm({
    resolver: zodResolver(eventSchema),
    defaultValues: initialValues,
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
  // passo atual — isDirty cobre todos os passos porque todos escrevem no mesmo
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
      // Nem no meio de um upload: a URL do vídeo ainda não existe.
      if (isVideoUploading) return;
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

  // ── [SD-WIZARD] Guarda de submit ───────────────────────────────────
  //
  // CAUSA RAIZ do submit automático ao chegar no último passo: o botão
  // "Avançar" e o botão de publicar ocupavam a MESMA posição na árvore do
  // JSX (os dois ramos do mesmo ternário, sem `key`). O React reconcilia
  // isso como UM ÚNICO elemento <button> e só troca o atributo `type` de
  // "button" para "submit" — o nó do DOM continua sendo o mesmo que o
  // usuário acabou de clicar.
  //
  // handleNextStep é async: o `await trigger(...)` devolve o controle ao
  // browser, o microtask resolve, o React re-renderiza e o `type` vira
  // "submit" ANTES de o browser executar a ação padrão daquele clique. O
  // clique em "Avançar" acaba ativando um botão que virou submit no meio
  // do caminho, e o formulário publica sozinho.
  //
  // Por isso o bug só aparecia na transição para o ÚLTIMO passo (era o
  // 3→4 quando o wizard tinha 4 passos; virou 4→5 com o passo de vídeo) —
  // é a única transição em que o botão troca de type.
  //
  // A correção principal está no JSX (`key` distinta em cada ramo, o que
  // faz o React desmontar um botão e montar outro). Esta guarda é a
  // segunda camada, independente dela: só deixa passar o submit que
  // realmente veio do botão de publicar E estando no último passo.
  // Qualquer outra origem (Enter, botão que trocou de type, submit
  // programático) é barrada aqui.
  function handleFormSubmit(event) {
    const submitter = event.nativeEvent?.submitter;
    const fromPublishButton = submitter?.dataset?.wizardSubmit === 'true';
    const isLastStep = currentStep === STEPS.length;

    // TEMPORÁRIO — diagnóstico do submit automático. Remover junto com os
    // demais logs [SD-WIZARD] depois da validação manual.
    console.debug('[SD-WIZARD] submit disparado', {
      origem: submitter ? `<${submitter.tagName.toLowerCase()}> "${submitter.textContent?.trim()}"` : 'SEM submitter (Enter ou submit programático)',
      ehBotaoPublicar: fromPublishButton,
      passoAtual: currentStep,
      totalPassos: STEPS.length,
      noUltimoPasso: isLastStep,
    });

    if (!fromPublishButton || !isLastStep) {
      event.preventDefault();
      console.warn('[SD-WIZARD] submit BLOQUEADO — não veio do botão de publicar no último passo. Nada foi salvo nem publicado.');
      return;
    }

    // Publicar agora gravaria a edição apontando para uma URL que o
    // Storage ainda não terminou de criar.
    if (isVideoUploading) {
      event.preventDefault();
      toast.error('Aguarde o envio do vídeo terminar antes de publicar.');
      console.warn('[SD-WIZARD] submit BLOQUEADO — upload de vídeo em andamento.');
      return;
    }

    console.debug('[SD-WIZARD] submit LIBERADO — publicando.');
    return handleSubmit(onSubmit, onInvalid)(event);
  }

  // Enter em campo de texto submete o formulário por padrão. Num wizard de
  // vários passos isso publica a edição a partir de qualquer passo, então
  // o Enter é neutralizado — exceto em <textarea>, onde ele é quebra de
  // linha e nunca submeteu, e em botões/links, onde Enter é o "clique" que
  // a acessibilidade por teclado exige.
  function handleFormKeyDown(event) {
    if (event.key !== 'Enter') return;
    const tag = event.target.tagName;
    if (tag === 'TEXTAREA' || tag === 'BUTTON' || tag === 'A') return;
    event.preventDefault();
    console.debug('[SD-WIZARD] Enter ignorado em', tag, '— use o botão para avançar/publicar.');
  }

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
  // passo com erro em vez de falhar silenciosamente no último passo.
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
    // TEMPORÁRIO — ver [SD-WIZARD] acima.
    console.debug('[SD-WIZARD] avançar', {
      de: currentStep,
      para: currentStep + 1,
      totalPassos: STEPS.length,
      fluxo: isCurrentValue ? 'edição atual (5 passos)' : 'edição passada (3 passos)',
    });

    if (currentStep >= STEPS.length) return;

    if (isVideoUploading) {
      toast.error('Aguarde o envio do vídeo terminar antes de avançar.');
      return;
    }

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

  // Salva o estado atual sem exigir os últimos passos nem forçar 'published' —
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
    if (isVideoUploading) {
      toast.error('Aguarde o envio do vídeo terminar antes de salvar.');
      return;
    }

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
      <form onSubmit={handleFormSubmit} onKeyDown={handleFormKeyDown} className="sd-form--panel">
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
          isCurrentValue decide a forma do wizard: atual (5 passos) ou
          passada (3 passos — banner sem CTA + conteúdo de arquivo +
          vídeo). EventStep5 ("Conteúdo de arquivo") só existe no modo
          reduzido, como passo 2; EventStepVideo existe nos dois, sempre
          como último passo, e por isso é o único bloco abaixo que testa o
          COMPRIMENTO do wizard em vez de um número fixo. */}
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
        {currentStep === STEPS.length && (
          <EventStepVideo
            register={register}
            errors={errors}
            watch={watch}
            setValue={setValue}
            eventId={draftIdRef.current}
            onUploadingChange={setIsVideoUploading}
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
            disabled={manualSaveMutation.isPending || isVideoUploading}
          >
            {manualSaveMutation.isPending
              ? 'Salvando…'
              : isEditMode ? 'Salvar alterações' : 'Salvar rascunho'}
          </button>

          {/* key distinta em cada ramo: sem ela o React vê os dois <button>
              na mesma posição da árvore, reaproveita o MESMO nó do DOM e
              só troca `type="button"` por `type="submit"` — e o clique em
              "Avançar" acaba ativando o botão já convertido em submit,
              publicando a edição sozinho (ver handleFormSubmit). Com keys
              diferentes o React desmonta um e monta o outro, então o nó
              clicado deixa de existir antes de virar submit. */}
          {currentStep < STEPS.length ? (
            <button
              key="wizard-next"
              type="button"
              className="sd-btn sd-btn--primary"
              onClick={handleNextStep}
            >
              Avançar
              <ChevronRight size={16} aria-hidden="true" />
            </button>
          ) : (
            <button
              key="wizard-submit"
              type="submit"
              data-wizard-submit="true"
              className="sd-btn sd-btn--primary"
              disabled={isSubmitting || saveMutation.isPending || isVideoUploading}
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

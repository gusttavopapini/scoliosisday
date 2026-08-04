// src/features/testimonials/components/TestimonialForm.jsx
// Formulário para criar/editar depoimentos. O type é escolhido primeiro e
// decide quais campos abaixo aparecem — quote (texto) ou videoUrl (vídeo).

import { useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import toast from 'react-hot-toast';
import { Plus, Trash2, UploadCloud } from 'lucide-react';
import t from '../../../i18n/pt-BR.js';
import { TESTIMONIAL_TYPES } from '../../../utils/constants.js';
import { useAuth } from '../../../hooks/useAuth.js';
import {
  useCreateTestimonial,
  useUpdateTestimonial,
  useDeleteTestimonial,
} from '../../../hooks/useTestimonials.js';
import { newTestimonialId } from '../../../services/testimonials.js';
import { uploadFile, validateFile, UPLOAD_PRESETS } from '../../../services/storageService.js';
import ConfirmModal from '../../../components/ui/ConfirmModal.jsx';
import DiscardChangesModal from '../../../components/ui/DiscardChangesModal.jsx';
import { useDiscardGuard } from '../../../hooks/useDiscardGuard.js';
import { testimonialSchema } from '../schemas/testimonialSchema.js';

const TYPE_TABS = [
  { value: TESTIMONIAL_TYPES.TEXT, label: t.testimonialType.text },
  { value: TESTIMONIAL_TYPES.VIDEO, label: t.testimonialType.video },
];

function defaultsFor(type, initialData) {
  if (initialData) return initialData;
  return type === TESTIMONIAL_TYPES.VIDEO
    ? { type, videoUrl: '', name: '', role: '', date: '' }
    : { type, quote: '', name: '', role: '', date: '' };
}

export default function TestimonialForm({ initialData, isEditMode = false }) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(null);
  const [uploadError, setUploadError] = useState('');

  // A listagem manda o tipo da aba ativa via ?type=text|video ao criar — o
  // toggle nasce travado nesse valor, para o formulário sempre corresponder
  // à aba de onde o usuário veio. Em edição, o tipo já vem de initialData e
  // continua livre para trocar.
  const typeFromUrl = searchParams.get('type');
  const isTypeLocked =
    !isEditMode &&
    (typeFromUrl === TESTIMONIAL_TYPES.TEXT || typeFromUrl === TESTIMONIAL_TYPES.VIDEO);
  const initialType = isTypeLocked ? typeFromUrl : TESTIMONIAL_TYPES.TEXT;

  // O upload de vídeo precisa do id do documento para montar o caminho no
  // Storage, e pode acontecer antes do primeiro salvamento — mesmo padrão de
  // SponsorForm/documentIdRef.
  const documentIdRef = useRef(initialData?.id ?? newTestimonialId());

  const createMutation = useCreateTestimonial();
  const updateMutation = useUpdateTestimonial();
  const deleteMutation = useDeleteTestimonial();

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting, isDirty },
  } = useForm({
    resolver: zodResolver(testimonialSchema),
    defaultValues: defaultsFor(initialType, initialData),
  });

  const type = watch('type');
  const isVideo = type === TESTIMONIAL_TYPES.VIDEO;
  const isUploading = uploadProgress !== null;

  const discard = useDiscardGuard({
    isDirty,
    onLeave: () => navigate('/painel/depoimentos'),
  });

  function handleTypeChange(nextType) {
    if (nextType === type) return;
    setValue('type', nextType, { shouldDirty: true });
    if (nextType === TESTIMONIAL_TYPES.VIDEO) {
      setValue('videoUrl', initialData?.videoUrl ?? '', { shouldDirty: true });
    } else {
      setValue('quote', initialData?.quote ?? '', { shouldDirty: true });
    }
  }

  async function handleVideoFile(event) {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;

    setUploadError('');
    try {
      validateFile(file, UPLOAD_PRESETS.testimonialVideo);
    } catch (validationError) {
      setUploadError(validationError.message);
      return;
    }

    setUploadProgress(0);
    try {
      const url = await uploadFile(`testimonials/${documentIdRef.current}/video`, file, setUploadProgress);
      setValue('videoUrl', url, { shouldDirty: true, shouldValidate: true });
    } catch {
      setUploadError('Falha no envio. Verifique a conexão e tente novamente.');
    } finally {
      setUploadProgress(null);
    }
  }

  async function onSubmit(data) {
    try {
      if (isEditMode && initialData?.id) {
        await updateMutation.mutateAsync({ id: initialData.id, data });
        toast.success(t.testimonials.updateSuccess);
      } else {
        await createMutation.mutateAsync({
          id: documentIdRef.current,
          data,
          createdBy: user?.uid ?? null,
        });
        toast.success(t.testimonials.createSuccess);
      }
      navigate('/painel/depoimentos');
    } catch (error) {
      console.error('Erro ao salvar depoimento:', error);
      toast.error(error.message || 'Erro ao salvar depoimento');
    }
  }

  async function handleDelete() {
    setIsDeleting(true);
    try {
      await deleteMutation.mutateAsync(initialData.id);
      toast.success(t.testimonials.deleteSuccess);
      navigate('/painel/depoimentos');
    } catch (error) {
      console.error('Erro ao excluir depoimento:', error);
      toast.error(error.message || 'Erro ao excluir depoimento');
    } finally {
      setIsDeleting(false);
      setDeleteConfirmOpen(false);
    }
  }

  return (
    <>
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="sd-form--panel"
        style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}
      >
        {/* ── Tipo ── */}
        <div className="sd-field">
          <span className="sd-label">Tipo</span>
          <div
            className="sd-tabs"
            role="tablist"
            aria-label="Tipo de depoimento"
            style={{ width: 'fit-content', opacity: isTypeLocked ? 0.6 : 1 }}
          >
            {TYPE_TABS.map((tab) => (
              <button
                key={tab.value}
                type="button"
                role="tab"
                aria-selected={type === tab.value}
                disabled={isTypeLocked}
                className={`sd-tabs__tab${type === tab.value ? ' sd-tabs__tab--active' : ''}`}
                style={isTypeLocked ? { cursor: 'not-allowed' } : undefined}
                onClick={() => handleTypeChange(tab.value)}
              >
                {tab.label}
              </button>
            ))}
          </div>
          {isTypeLocked && (
            <span className="sd-note">
              Tipo definido pela aba de origem — para mudar, volte à listagem e use "Novo depoimento" na outra aba.
            </span>
          )}
        </div>

        {/* ── Conteúdo (texto) ── */}
        {!isVideo && (
          <label className="sd-field">
            <span className="sd-label">{t.testimonials.quote}</span>
            <textarea
              {...register('quote')}
              className="sd-input"
              rows={4}
              placeholder={t.testimonials.quotePlaceholder}
            />
            {errors.quote && <span className="sd-error">{errors.quote.message}</span>}
          </label>
        )}

        {/* ── URL do vídeo ── */}
        {isVideo && (
          <div className="sd-field">
            <span className="sd-label">{t.testimonials.videoUrl}</span>
            <input
              {...register('videoUrl')}
              className="sd-input"
              type="text"
              placeholder="https://youtube.com/watch?v=… ou https://vimeo.com/…"
            />
            <span className="sd-note">{t.testimonials.videoUrlHint}</span>
            {errors.videoUrl && <span className="sd-error">{errors.videoUrl.message}</span>}

            <label
              className="sd-btn sd-btn--outline sd-btn--sm"
              style={{ marginTop: 'var(--space-3)', width: 'fit-content', cursor: isUploading ? 'default' : 'pointer' }}
            >
              <UploadCloud size={15} aria-hidden="true" />
              {isUploading ? `Enviando… ${uploadProgress}%` : t.testimonials.videoUpload}
              <input
                type="file"
                className="sr-only"
                accept="video/mp4"
                onChange={handleVideoFile}
                disabled={isUploading}
              />
            </label>
            <span className="sd-note" style={{ display: 'block', marginTop: 'var(--space-1)' }}>
              {uploadError || t.testimonials.videoUploadHint}
            </span>
          </div>
        )}

        {/* ── Nome ── */}
        <label className="sd-field">
          <span className="sd-label">{t.testimonials.name}</span>
          <input {...register('name')} className="sd-input" type="text" placeholder="Ex: Dra. Ana Lima" />
          {errors.name && <span className="sd-error">{errors.name.message}</span>}
        </label>

        {/* ── Cargo ── */}
        <label className="sd-field">
          <span className="sd-label">{t.testimonials.role}</span>
          <input {...register('role')} className="sd-input" type="text" placeholder="Ex: Fisioterapeuta" />
          {errors.role && <span className="sd-error">{errors.role.message}</span>}
        </label>

        {/* ── Data ── */}
        <label className="sd-field" style={{ maxWidth: '220px' }}>
          <span className="sd-label">{t.testimonials.date}</span>
          <input {...register('date')} className="sd-input" type="date" />
          {errors.date && <span className="sd-error">{errors.date.message}</span>}
        </label>

        {/* ── Botões de ação ── */}
        <div style={{ display: 'flex', gap: 'var(--space-3)', justifyContent: 'flex-end', alignItems: 'center' }}>
          {isEditMode && (
            <button
              type="button"
              className="sd-btn sd-btn--outline sd-btn--danger"
              onClick={() => setDeleteConfirmOpen(true)}
              disabled={isDeleting}
              style={{ marginRight: 'auto' }}
            >
              <Trash2 size={16} aria-hidden="true" />
              {t.common.delete}
            </button>
          )}

          <button type="button" className="sd-btn sd-btn--outline" onClick={discard.requestLeave}>
            {t.common.cancel}
          </button>

          <button
            type="submit"
            className="sd-btn sd-btn--primary"
            disabled={isSubmitting || createMutation.isPending || updateMutation.isPending}
          >
            <Plus size={16} aria-hidden="true" />
            {isEditMode ? 'Atualizar' : 'Criar'} depoimento
          </button>
        </div>
      </form>

      {deleteConfirmOpen && (
        <ConfirmModal
          title={t.common.deleteConfirmTitle.replace('{name}', initialData?.name ?? '')}
          itemName={initialData?.name}
          warning={t.common.deleteConfirmBody}
          isBusy={isDeleting}
          onCancel={() => setDeleteConfirmOpen(false)}
          onConfirm={handleDelete}
        />
      )}

      {discard.isConfirmOpen && (
        <DiscardChangesModal onCancel={discard.cancelLeave} onConfirm={discard.confirmLeave} />
      )}
    </>
  );
}

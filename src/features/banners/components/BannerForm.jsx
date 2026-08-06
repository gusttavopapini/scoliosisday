// src/features/banners/components/BannerForm.jsx
// Formulário para criar/editar banners do carrossel da Home.
//
// Regra de negócio: no máximo 5 banners ativos simultaneamente, contando o
// banner do evento atual (isCurrent:true) junto com os banners manuais
// active:true. A checagem só bloqueia ATIVAR — salvar como inativo nunca
// esbarra no limite, mesmo com o total já no teto.

import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import toast from 'react-hot-toast';
import { Plus, Trash2 } from 'lucide-react';
import { useCreateBanner, useUpdateBanner, useDeleteBanner, useBanners } from '../../../hooks/useBanners.js';
import { useCurrentEvent } from '../../../hooks/useEvents.js';
import ConfirmModal from '../../../components/ui/ConfirmModal.jsx';
import DiscardChangesModal from '../../../components/ui/DiscardChangesModal.jsx';
import { useDiscardGuard } from '../../../hooks/useDiscardGuard.js';
import { bannerSchema } from '../schemas/bannerSchema.js';
import { newBannerId } from '../../../services/banners.js';
import { UPLOAD_PRESETS } from '../../../services/storageService.js';
import ImageUploader from '../../../components/form/ImageUploader.jsx';
import t from '../../../i18n/pt-BR.js';

const BANNER_FIELDS = [
  { name: 'bannerDesktopUrl', slug: 'banner-desktop', label: 'Banner Desktop', size: '1920×1080px', ratio: '16 / 9' },
  { name: 'bannerTabletUrl', slug: 'banner-tablet', label: 'Banner Tablet', size: '1024×768px', ratio: '4 / 3' },
  { name: 'bannerMobileUrl', slug: 'banner-mobile', label: 'Banner Mobile', size: '640×960px', ratio: '2 / 3' },
];

export default function BannerForm({ initialData, isEditMode = false, onSuccess }) {
  const navigate = useNavigate();
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // O caminho das artes no Storage precisa do id do documento, e o upload
  // pode acontecer antes do primeiro salvamento — mesmo padrão de SponsorForm.
  const documentIdRef = useRef(initialData?.id ?? newBannerId());

  const createMutation = useCreateBanner();
  const updateMutation = useUpdateBanner();
  const deleteMutation = useDeleteBanner();

  // Dados para o cálculo do limite de 5 ativos: a lista inteira de banners
  // (para contar quantos outros estão active:true) e o evento em destaque no
  // painel — não a versão pública, porque a checagem vale mesmo com o evento
  // atual ainda em rascunho.
  const { data: allBanners = [] } = useBanners();
  const { data: currentEvent } = useCurrentEvent();

  // Mesclado, não `initialData || {...}` — mesmo bug corrigido em
  // EventForm.jsx: um banner editado sem tocar num campo ausente de
  // initialData nasceria undefined (não o default seguro), e undefined
  // nunca sobrevive a um setDoc(). Nenhum campo aqui é opcional hoje, mas o
  // padrão fica protegido contra o mesmo problema em campos futuros.
  const DEFAULT_VALUES = {
    headline: '',
    subtitle: '',
    cta: '',
    ctaLink: '',
    bannerDesktopUrl: '',
    bannerTabletUrl: '',
    bannerMobileUrl: '',
    order: 1,
    active: false,
  };

  const {
    register,
    control,
    handleSubmit,
    formState: { errors, isSubmitting, isDirty },
  } = useForm({
    resolver: zodResolver(bannerSchema),
    defaultValues: { ...DEFAULT_VALUES, ...initialData },
  });

  const discard = useDiscardGuard({
    isDirty,
    onLeave: () => navigate('/painel/banners'),
  });

  async function onSubmit(data) {
    if (data.active) {
      const otherActiveCount = allBanners.filter(
        (banner) => banner.active && banner.id !== documentIdRef.current,
      ).length;
      const totalActive = (currentEvent ? 1 : 0) + otherActiveCount;

      if (totalActive >= 5) {
        toast.error(t.banners.limitReached);
        return;
      }
    }

    try {
      if (isEditMode && initialData?.id) {
        await updateMutation.mutateAsync({ id: initialData.id, data });
        toast.success('Banner atualizado com sucesso!');
      } else {
        await createMutation.mutateAsync({ id: documentIdRef.current, data });
        toast.success('Banner criado com sucesso!');
      }
      navigate('/painel/banners');
      onSuccess?.();
    } catch (error) {
      console.error('Erro ao salvar banner:', error);
      toast.error(error.message || 'Erro ao salvar banner');
    }
  }

  async function handleDelete() {
    setIsDeleting(true);
    try {
      await deleteMutation.mutateAsync(initialData.id);
      toast.success('Banner excluído com sucesso!');
      navigate('/painel/banners');
    } catch (error) {
      console.error('Erro ao excluir banner:', error);
      toast.error(error.message || 'Erro ao excluir banner');
    } finally {
      setIsDeleting(false);
      setDeleteConfirmOpen(false);
    }
  }

  return (
    <>
      <form onSubmit={handleSubmit(onSubmit)} className="sd-form--panel" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>
        {/* ── Título ── */}
        <label className="sd-field">
          <span className="sd-label">Título</span>
          <input
            {...register('headline')}
            className="sd-input"
            type="text"
            placeholder="Ex: Inscrições abertas para o Curso de Extensão"
            maxLength={120}
          />
          {errors.headline && <span className="sd-error">{errors.headline.message}</span>}
        </label>

        {/* ── Descrição ── */}
        <label className="sd-field">
          <span className="sd-label">Descrição <span className="sd-muted">(opcional)</span></span>
          <textarea
            {...register('subtitle')}
            className="sd-textarea"
            placeholder="Descrição breve exibida abaixo do título"
            maxLength={200}
            rows={3}
          />
          {errors.subtitle && <span className="sd-error">{errors.subtitle.message}</span>}
        </label>

        {/* ── CTA ── */}
        <label className="sd-field">
          <span className="sd-label">Call-to-Action <span className="sd-muted">(opcional)</span></span>
          <input
            {...register('cta')}
            className="sd-input"
            type="text"
            placeholder="Ex: Saiba mais"
            maxLength={40}
          />
          {errors.cta && <span className="sd-error">{errors.cta.message}</span>}
        </label>

        {/* ── Link do CTA ── */}
        <label className="sd-field">
          <span className="sd-label">Link do CTA <span className="sd-muted">(opcional)</span></span>
          <input
            {...register('ctaLink')}
            className="sd-input"
            type="url"
            placeholder="https://exemplo.com"
          />
          <span className="sd-note">Sem link, o banner é exibido sem botão de ação.</span>
          {errors.ctaLink && <span className="sd-error">{errors.ctaLink.message}</span>}
        </label>

        {/* ── Banners por breakpoint ── */}
        {BANNER_FIELDS.map(({ name, slug, label, size, ratio }) => (
          <div className="sd-field" key={name}>
            <span className="sd-label">
              {label} <span className="sd-muted">({size})</span>
            </span>
            <Controller
              name={name}
              control={control}
              render={({ field }) => (
                <ImageUploader
                  value={field.value || ''}
                  onChange={(url) => field.onChange(url)}
                  path={`banners/${documentIdRef.current}/${slug}`}
                  label={label}
                  aspectRatio={ratio}
                  {...UPLOAD_PRESETS.eventBanner}
                />
              )}
            />
            <span className="sd-note">Tamanho recomendado: {size}.</span>
          </div>
        ))}

        {/* ── Ordem ── */}
        <label className="sd-field" style={{ maxWidth: '260px' }}>
          <span className="sd-label">Ordem no carrossel</span>
          <Controller
            name="order"
            control={control}
            render={({ field }) => (
              <input
                className="sd-input"
                type="number"
                min={1}
                step={1}
                value={field.value ?? ''}
                onChange={(event) => {
                  const raw = event.target.value;
                  field.onChange(raw === '' ? '' : Number(raw));
                }}
              />
            )}
          />
          {errors.order && <span className="sd-error">{errors.order.message}</span>}
          <span className="sd-note">
            Mesmo espaço numérico da posição do evento atual — define a ordem
            entre todos os itens do carrossel.
          </span>
        </label>

        {/* ── Ativo ── */}
        <div className="sd-field">
          <label className="sda-switch">
            <input {...register('active')} type="checkbox" />
            <span className="sda-switch__track" aria-hidden="true" />
            <span className="sda-switch__label">Banner ativo</span>
          </label>
          <span className="sd-note">
            Máximo de 5 banners ativos simultaneamente, contando o banner do
            evento atual.
          </span>
        </div>

        {/* ── Botões de ação ── */}
        <div
          style={{
            display: 'flex',
            gap: 'var(--space-3)',
            justifyContent: 'flex-end',
            alignItems: 'center',
          }}
        >
          {isEditMode && (
            <button
              type="button"
              className="sd-btn sd-btn--outline sd-btn--danger"
              onClick={() => setDeleteConfirmOpen(true)}
              disabled={isDeleting}
              style={{ marginRight: 'auto' }}
            >
              <Trash2 size={16} aria-hidden="true" />
              Excluir
            </button>
          )}

          <button
            type="button"
            className="sd-btn sd-btn--outline"
            onClick={discard.requestLeave}
          >
            Cancelar
          </button>

          <button
            type="submit"
            className="sd-btn sd-btn--primary"
            disabled={isSubmitting || createMutation.isPending || updateMutation.isPending}
          >
            <Plus size={16} aria-hidden="true" />
            {isEditMode ? 'Atualizar' : 'Criar'} Banner
          </button>
        </div>
      </form>

      {deleteConfirmOpen && (
        <ConfirmModal
          title="Excluir banner?"
          itemName={initialData?.headline}
          warning="Esta ação não pode ser desfeita."
          confirmLabel="Confirmar exclusão"
          isBusy={isDeleting}
          onCancel={() => setDeleteConfirmOpen(false)}
          onConfirm={handleDelete}
        />
      )}
      {discard.isConfirmOpen && (
        <DiscardChangesModal
          onCancel={discard.cancelLeave}
          onConfirm={discard.confirmLeave}
        />
      )}
    </>
  );
}

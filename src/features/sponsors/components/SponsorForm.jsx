// src/features/sponsors/components/SponsorForm.jsx
// Formulário para criar/editar patrocinadores.

import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import toast from 'react-hot-toast';
import { Plus, Trash2 } from 'lucide-react';
import { useCreateSponsor, useUpdateSponsor, useDeleteSponsor } from '../../../hooks/useSponsors.js';
import { useCascades } from '../../../hooks/useIntegrity.js';
import ConfirmModal from '../../../components/ui/ConfirmModal.jsx';
import DiscardChangesModal from '../../../components/ui/DiscardChangesModal.jsx';
import { useDiscardGuard } from '../../../hooks/useDiscardGuard.js';
import { sponsorSchema } from '../schemas/sponsorSchema.js';
import { newSponsorId } from '../../../services/sponsors.js';
import { UPLOAD_PRESETS } from '../../../services/storageService.js';
import ImageUploader from '../../../components/form/ImageUploader.jsx';
import { SPONSOR_TYPES } from '../../../utils/constants.js';

const SPONSOR_TYPE_OPTIONS = [
  { value: SPONSOR_TYPES.SPONSOR, label: 'Patrocinador' },
  { value: SPONSOR_TYPES.SUPPORTER, label: 'Apoiador' },
];

export default function SponsorForm({ initialData, isEditMode = false, onSuccess }) {
  const navigate = useNavigate();
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // O caminho da logo no Storage precisa do id do documento, e o upload pode
  // acontecer antes do primeiro salvamento. Em criação, o id é sorteado aqui e
  // depois reaproveitado no setDoc; em edição, é o do próprio documento.
  const documentIdRef = useRef(initialData?.id ?? newSponsorId());

  const createMutation = useCreateSponsor();
  const updateMutation = useUpdateSponsor();
  const deleteMutation = useDeleteSponsor();
  const { cascadeSponsor } = useCascades();

  // Mesclado, não `initialData || {...}` — mesmo bug corrigido em
  // EventForm.jsx/BannerForm.jsx: um patrocinador antigo, sem a chave
  // `type` no Firestore, nasceria com o campo undefined em vez do default
  // seguro, e undefined nunca sobrevive a um setDoc()/updateDoc().
  const DEFAULT_VALUES = {
    name: '',
    website: '',
    logoUrl: null,
    type: SPONSOR_TYPES.SPONSOR,
  };

  const {
    register,
    control,
    handleSubmit,
    formState: { errors, isSubmitting, isDirty },
  } = useForm({
    resolver: zodResolver(sponsorSchema),
    defaultValues: { ...DEFAULT_VALUES, ...initialData },
  });

  // Cancelar sai direto quando nada mudou; com alteração, confirma antes.
  const discard = useDiscardGuard({
    isDirty,
    onLeave: () => navigate('/painel/patrocinadores'),
  });

  async function onSubmit(data) {
    try {
      let website = data.website;
      if (!website.startsWith('http://') && !website.startsWith('https://')) {
        website = `https://${website}`;
      }

      if (isEditMode && initialData?.id) {
        await updateMutation.mutateAsync({
          id: initialData.id,
          data: { ...data, website },
        });
        toast.success('Patrocinador atualizado com sucesso!');
      } else {
        await createMutation.mutateAsync({
          id: documentIdRef.current,
          data: { ...data, website },
        });
        toast.success('Patrocinador criado com sucesso!');
      }
      navigate('/painel/patrocinadores');
      onSuccess?.();
    } catch (error) {
      console.error('Erro ao salvar patrocinador:', error);
      toast.error(error.message || 'Erro ao salvar patrocinador');
    }
  }

  async function handleDelete() {
    setIsDeleting(true);
    try {
      // Cascata antes da exclusão: nenhum evento pode ficar apontando
      // para um patrocinador que não existe mais.
      const affected = await cascadeSponsor(initialData.id);
      await deleteMutation.mutateAsync(initialData.id);
      toast.success(
        affected > 0
          ? `Patrocinador excluído e removido de ${affected} evento${affected !== 1 ? 's' : ''}.`
          : 'Patrocinador excluído com sucesso!',
      );
      navigate('/painel/patrocinadores');
    } catch (error) {
      console.error('Erro ao excluir patrocinador:', error);
      toast.error(error.message || 'Erro ao excluir patrocinador');
    } finally {
      setIsDeleting(false);
      setDeleteConfirmOpen(false);
    }
  }

  return (
    <>
      <form onSubmit={handleSubmit(onSubmit)} className="sd-form--panel" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>
        {/* ── Nome ── */}
        <label className="sd-field">
          <span className="sd-label">Nome</span>
          <input
            {...register('name')}
            className="sd-input"
            type="text"
            placeholder="Ex: HC-USP"
          />
          {errors.name && (
            <span className="sd-error">{errors.name.message}</span>
          )}
        </label>

        {/* ── Link do site ── */}
        <label className="sd-field">
          <span className="sd-label">Link do site</span>
          <input
            {...register('website')}
            className="sd-input"
            type="text"
            placeholder="Ex: hcusp.br ou https://hcusp.br"
          />
          <span className="sd-note">https:// será adicionado automaticamente se omitido</span>
          {errors.website && (
            <span className="sd-error">{errors.website.message}</span>
          )}
        </label>

        {/* ── Logo (opcional) ── */}
        <div className="sd-field">
          <span className="sd-label">Logo <span className="sd-muted">(opcional)</span></span>
          <Controller
            name="logoUrl"
            control={control}
            render={({ field }) => (
              <ImageUploader
                value={field.value || ''}
                onChange={(url) => field.onChange(url || null)}
                path={`sponsors/${documentIdRef.current}/logo`}
                label="Logo do patrocinador"
                {...UPLOAD_PRESETS.sponsorLogo}
              />
            )}
          />
          <span className="sd-note">Sem logo, o nome do patrocinador é exibido no lugar.</span>
        </div>

        {/* ── Tipo ── */}
        <label className="sd-field">
          <span className="sd-label">Tipo</span>
          <span className="sd-select-wrap">
            <select {...register('type')} className="sd-select">
              {SPONSOR_TYPE_OPTIONS.map(({ value, label }) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </span>
          <span className="sd-note">
            Apoiadores também entram na esteira de logos da Home, além da
            grade de /patrocinadores.
          </span>
          {errors.type && (
            <span className="sd-error">{errors.type.message}</span>
          )}
        </label>

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
            {isEditMode ? 'Atualizar' : 'Criar'} Patrocinador
          </button>
        </div>
      </form>

      {/* ── Delete Confirm Modal ── */}
      {deleteConfirmOpen && (
        <ConfirmModal
          title="Excluir patrocinador?"
          itemName={initialData?.name}
          body={
            <p className="sd-small sd-muted">
              Ele também será removido de todos os eventos que o exibem.
            </p>
          }
          warning="Esta ação não pode ser desfeita."
          confirmLabel="Confirmar exclusão"
          isBusy={isDeleting}
          onCancel={() => setDeleteConfirmOpen(false)}
          onConfirm={handleDelete}
        />
      )}
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

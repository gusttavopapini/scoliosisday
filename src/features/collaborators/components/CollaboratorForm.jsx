// src/features/collaborators/components/CollaboratorForm.jsx
// Formulário para criar/editar colaboradores com React Hook Form + Zod.

import { useState, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import toast from 'react-hot-toast';
import { Plus, Trash2 } from 'lucide-react';
import { useCreateCollaborator, useUpdateCollaborator, useDeleteCollaborator } from '../../../hooks/useCollaborators.js';
import { newCollaboratorId } from '../../../services/collaborators.js';
import { UPLOAD_PRESETS } from '../../../services/storageService.js';
import ImageUploader from '../../../components/form/ImageUploader.jsx';
import { useCollaboratorUsages } from '../../../hooks/useIntegrity.js';
import ConfirmModal from '../../../components/ui/ConfirmModal.jsx';
import DiscardChangesModal from '../../../components/ui/DiscardChangesModal.jsx';
import { useDiscardGuard } from '../../../hooks/useDiscardGuard.js';
import ReferenceBlockedModal from '../../../components/ui/ReferenceBlockedModal.jsx';
import { collaboratorSchema } from '../schemas/collaboratorSchema.js';
import { COLLABORATOR_TYPES, AVATAR_COLORS } from '../../../utils/constants.js';
import { avatarColorIndex } from '../../../utils/initials.js';
import RichTextEditor from './RichTextEditor.jsx';
import CountryCombobox from '../../../components/form/CountryCombobox.jsx';
import t from '../../../i18n/pt-BR.js';

const COLLABORATOR_TYPE_OPTIONS = [
  { value: COLLABORATOR_TYPES.SPEAKER, label: t.collaboratorType.speaker },
  { value: COLLABORATOR_TYPES.SCIENTIFIC_CURATOR, label: t.collaboratorType.scientific_curator },
  { value: COLLABORATOR_TYPES.ORGANIZER, label: t.collaboratorType.organizer },
];

/**
 * @param {{ initialData?: Object, isEditMode?: boolean, onSuccess?: () => void }} props
 */
export default function CollaboratorForm({ initialData, isEditMode = false, onSuccess }) {
  const navigate = useNavigate();
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  // { usages, reason: 'delete' | 'type' }
  const [blocked, setBlocked] = useState(null);

  // O caminho da foto no Storage precisa do id do documento, e o upload pode
  // acontecer antes do primeiro salvamento. Em criação, o id é sorteado aqui e
  // depois reaproveitado no setDoc; em edição, é o do próprio documento.
  const documentIdRef = useRef(initialData?.id ?? newCollaboratorId());

  const createMutation = useCreateCollaborator();
  const updateMutation = useUpdateCollaborator();
  const deleteMutation = useDeleteCollaborator();
  const { check: checkUsages, isChecking } = useCollaboratorUsages();

  const {
    register,
    control,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting, isDirty },
  } = useForm({
    resolver: zodResolver(collaboratorSchema),
    defaultValues: initialData || {
      firstName: '',
      lastName: '',
      photoUrl: null,
      flag: '',
      curriculum: '',
      type: COLLABORATOR_TYPES.SPEAKER,
    },
  });

  // Cancelar sai direto quando nada mudou; com alteração, confirma antes.
  const discard = useDiscardGuard({
    isDirty,
    onLeave: () => navigate('/painel/colaboradores'),
  });

  // Derivar fullName e avatarColor do initialData.id para exibição.
  // watch() já provoca re-render a cada tecla: memoizar uma concatenação
  // de duas strings só adicionaria dependências instáveis.
  const firstName = watch('firstName');
  const lastName = watch('lastName');
  const derivedFullName =
    initialData?.id && firstName && lastName ? `${firstName} ${lastName}` : null;

  const avatarColor = useMemo(() => {
    if (!initialData?.id) return null;
    const colorIndex = avatarColorIndex(initialData.id, AVATAR_COLORS.length);
    return AVATAR_COLORS[colorIndex];
  }, [initialData?.id]);

  async function onSubmit(data) {
    try {
      // Deixar de ser palestrante quebraria os vínculos existentes.
      const stoppedBeingSpeaker =
        isEditMode &&
        initialData?.type === COLLABORATOR_TYPES.SPEAKER &&
        data.type !== COLLABORATOR_TYPES.SPEAKER;

      if (stoppedBeingSpeaker && initialData?.id) {
        const usages = await checkUsages(initialData.id);
        if (usages.total > 0) {
          setBlocked({ usages, reason: 'type' });
          return;
        }
      }

      if (isEditMode && initialData?.id) {
        await updateMutation.mutateAsync({
          id: initialData.id,
          data: {
            ...data,
            fullName: `${data.firstName} ${data.lastName}`,
          },
        });
        toast.success('Colaborador atualizado com sucesso!');
      } else {
        await createMutation.mutateAsync({
          id: documentIdRef.current,
          data: {
            ...data,
            fullName: `${data.firstName} ${data.lastName}`,
          },
        });
        toast.success('Colaborador criado com sucesso!');
      }
      navigate('/painel/colaboradores');
      onSuccess?.();
    } catch (error) {
      console.error('Erro ao salvar colaborador:', error);
      toast.error(error.message || 'Erro ao salvar colaborador');
    }
  }

  /** Verifica os vínculos antes de abrir a confirmação de exclusão. */
  async function handleDeleteRequest() {
    try {
      const usages = await checkUsages(initialData.id);
      if (usages.total > 0) {
        setBlocked({ usages, reason: 'delete' });
        return;
      }
      setDeleteConfirmOpen(true);
    } catch (error) {
      toast.error(error.message || 'Erro ao verificar vínculos do colaborador');
    }
  }

  async function handleDelete() {
    setIsDeleting(true);
    try {
      await deleteMutation.mutateAsync(initialData.id);
      toast.success('Colaborador excluído com sucesso!');
      navigate('/painel/colaboradores');
    } catch (error) {
      console.error('Erro ao excluir colaborador:', error);
      toast.error(error.message || 'Erro ao excluir colaborador');
    } finally {
      setIsDeleting(false);
      setDeleteConfirmOpen(false);
    }
  }

  return (
    <>
      <form onSubmit={handleSubmit(onSubmit)} className="sd-form--panel" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>
        {/* ── Avatar Preview (apenas modo edição) ── */}
        {isEditMode && initialData?.id && derivedFullName && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--space-4)',
            }}
          >
            <div
              style={{
                width: 64,
                height: 64,
                borderRadius: 'var(--radius-full)',
                backgroundColor: avatarColor,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontSize: 'var(--fs-lg)',
                fontWeight: 'var(--fw-semibold)',
              }}
            >
              {derivedFullName
                .split(' ')
                .slice(0, 2)
                .map((word) => word[0])
                .join('')
                .toUpperCase()}
            </div>
            <div>
              <p style={{ fontWeight: 'var(--fw-semibold)', color: 'var(--text-heading)' }}>
                {derivedFullName}
              </p>
              <p className="sd-small sd-muted">ID: {initialData.id}</p>
            </div>
          </div>
        )}

        {/* ── Nome ── */}
        <label className="sd-field">
          <span className="sd-label">Nome</span>
          <input
            {...register('firstName')}
            className="sd-input"
            type="text"
            placeholder="Ex: Ana"
          />
          {errors.firstName && (
            <span className="sd-error">{errors.firstName.message}</span>
          )}
        </label>

        {/* ── Sobrenome ── */}
        <label className="sd-field">
          <span className="sd-label">Sobrenome</span>
          <input
            {...register('lastName')}
            className="sd-input"
            type="text"
            placeholder="Ex: Lima"
          />
          {errors.lastName && (
            <span className="sd-error">{errors.lastName.message}</span>
          )}
        </label>

        {/* ── Foto (opcional) ── */}
        <div className="sd-field">
          <span className="sd-label">Foto <span className="sd-muted">(opcional)</span></span>
          <Controller
            name="photoUrl"
            control={control}
            render={({ field }) => (
              <ImageUploader
                value={field.value || ''}
                onChange={(url) => field.onChange(url || null)}
                path={`collaborators/${documentIdRef.current}/photo`}
                label="Foto do colaborador"
                square
                {...UPLOAD_PRESETS.collaboratorPhoto}
              />
            )}
          />
          <span className="sd-note">Sem foto, o avatar é gerado a partir das iniciais.</span>
        </div>

        {/* ── Bandeira / País (opcional) ──
            <div>, não <label>: um <label> em volta faria qualquer clique
            dentro do combobox (inclusive nas opções da lista) voltar o
            foco pro input, atrapalhando a seleção. O rótulo aponta pro
            campo por htmlFor/id. */}
        <div className="sd-field">
          <label className="sd-label" htmlFor="collaborator-flag">
            Bandeira <span className="sd-muted">(opcional)</span>
          </label>
          <Controller
            name="flag"
            control={control}
            render={({ field }) => (
              <CountryCombobox
                id="collaborator-flag"
                value={field.value ?? ''}
                onChange={field.onChange}
              />
            )}
          />
          <span className="sd-note">
            Exibida ao lado do nome no card do site público. Busque por nome, sigla (BR, NL) ou
            apelido — &ldquo;Holanda&rdquo; encontra Países Baixos.
          </span>
        </div>

        {/* ── Currículo (TipTap) ── */}
        <label className="sd-field">
          <span className="sd-label">Currículo</span>
          <Controller
            name="curriculum"
            control={control}
            render={({ field }) => (
              <RichTextEditor value={field.value} onChange={field.onChange} />
            )}
          />
          {errors.curriculum && (
            <span className="sd-error">{errors.curriculum.message}</span>
          )}
        </label>

        {/* ── Tipo ── */}
        <label className="sd-field">
          <span className="sd-label">Tipo</span>
          <span className="sd-select-wrap">
            <select {...register('type')} className="sd-select">
              {COLLABORATOR_TYPE_OPTIONS.map(({ value, label }) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
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
              onClick={handleDeleteRequest}
              disabled={isDeleting || isChecking}
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
            {isEditMode ? 'Atualizar' : 'Criar'} Colaborador
          </button>
        </div>
      </form>

      {/* ── Delete Confirm Modal ── */}
      {deleteConfirmOpen && (
        <ConfirmModal
          title="Excluir colaborador?"
          itemName={derivedFullName}
          warning={t.common.deleteConfirmBody}
          confirmLabel="Confirmar exclusão"
          isBusy={isDeleting}
          onCancel={() => setDeleteConfirmOpen(false)}
          onConfirm={handleDelete}
        />
      )}

      {/* ── Bloqueio por integridade referencial ── */}
      {blocked && (
        <ReferenceBlockedModal
          title={blocked.reason === 'type' ? 'Tipo não pode ser alterado' : 'Colaborador em uso'}
          itemName={derivedFullName}
          intro={
            blocked.reason === 'type'
              ? 'Este colaborador deixaria de ser palestrante, mas ainda está vinculado aos itens abaixo. Remova os vínculos antes de trocar o tipo.'
              : 'Não é possível excluir: este colaborador está vinculado aos itens abaixo. Remova os vínculos antes de excluí-lo.'
          }
          usages={blocked.usages}
          onClose={() => setBlocked(null)}
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

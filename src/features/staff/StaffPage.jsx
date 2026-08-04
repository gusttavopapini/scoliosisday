// src/features/staff/StaffPage.jsx
// Equipe (seção 11.6) — exclusivo do administrador.
// Aba 1: cadastros aguardando aprovação. Aba 2: membros ativos.

import { useState, useMemo } from 'react';
import { Plus } from 'lucide-react';
import toast from 'react-hot-toast';
import AppShell from '../../app/AppShell.jsx';
import t from '../../i18n/pt-BR.js';
import ConfirmModal from '../../components/ui/ConfirmModal.jsx';
import { USER_STATUS } from '../../utils/constants.js';
import { useAuth } from '../../hooks/useAuth.js';
import {
  useStaffUsers,
  useApproveStaffUser,
  useRejectStaffUser,
  useDisableStaffUser,
  useDeleteStaffUser,
  useCreateStaffMember,
} from '../../hooks/useStaff.js';
import StaffSkeleton from './components/StaffSkeleton.jsx';
import StaffEmpty from './components/StaffEmpty.jsx';
import StaffPendingTable from './components/StaffPendingTable.jsx';
import StaffActiveTable from './components/StaffActiveTable.jsx';
import CreateStaffModal from './components/CreateStaffModal.jsx';

const TABS = {
  PENDING: 'pending',
  ACTIVE: 'active',
};

const PENDING_COLUMNS = [t.staff.email, t.staff.requestDate];
const ACTIVE_COLUMNS = [t.staff.email, t.staff.role, 'Data de aprovação', 'Último acesso'];

export default function StaffPage() {
  const { user } = useAuth();
  const currentUserId = user?.uid ?? null;

  const [activeTab, setActiveTab] = useState(TABS.PENDING);
  const [createOpen, setCreateOpen] = useState(false);
  // { user, action: 'reject' | 'disable' | 'delete' }
  const [confirmTarget, setConfirmTarget] = useState(null);

  const { data: users = [], isLoading } = useStaffUsers();

  const approveMutation = useApproveStaffUser();
  const rejectMutation = useRejectStaffUser();
  const disableMutation = useDisableStaffUser();
  const deleteMutation = useDeleteStaffUser();
  const createMutation = useCreateStaffMember();

  const pendingUsers = useMemo(
    () => users.filter((u) => u.status === USER_STATUS.PENDING),
    [users],
  );

  const activeUsers = useMemo(
    () => users.filter((u) => u.status === USER_STATUS.APPROVED),
    [users],
  );

  const isBusy =
    approveMutation.isPending ||
    rejectMutation.isPending ||
    disableMutation.isPending ||
    deleteMutation.isPending;

  // ── Ações ──

  function handleApprove(target) {
    approveMutation.mutate(
      { uid: target.id, email: target.email },
      {
        onSuccess: () => toast.success(`${target.email} aprovado. E-mail enviado.`),
        onError: (error) => toast.error(error.message || 'Erro ao aprovar cadastro'),
      },
    );
  }

  function handleConfirm() {
    if (!confirmTarget) return;
    const { user: target, action } = confirmTarget;

    const config = {
      reject: {
        mutation: rejectMutation,
        success: `Cadastro de ${target.email} recusado.`,
        error: 'Erro ao recusar cadastro',
      },
      disable: {
        mutation: disableMutation,
        success: `${target.email} foi desativado.`,
        error: 'Erro ao desativar membro',
      },
      delete: {
        mutation: deleteMutation,
        success: `${target.email} foi removido da equipe.`,
        error: 'Erro ao remover membro',
      },
    }[action];

    config.mutation.mutate(target.id, {
      onSuccess: () => {
        setConfirmTarget(null);
        toast.success(config.success);
      },
      onError: (error) => {
        toast.error(
          error.message === 'CANNOT_MODIFY_SELF'
            ? t.staff.cannotEditSelf
            : error.message || config.error,
        );
      },
    });
  }

  async function handleCreate(data) {
    try {
      await createMutation.mutateAsync(data);
      setCreateOpen(false);
      setActiveTab(TABS.ACTIVE);
      toast.success(`${data.email} adicionado à equipe.`);
    } catch (error) {
      const message =
        error.code === 'auth/email-already-in-use'
          ? 'Este e-mail já possui uma conta.'
          : error.message || 'Erro ao criar membro';
      toast.error(message);
    }
  }

  // ── Render ──

  const isPendingTab = activeTab === TABS.PENDING;
  const visibleUsers = isPendingTab ? pendingUsers : activeUsers;
  const isEmpty = !isLoading && visibleUsers.length === 0;

  return (
    <>
      <AppShell activeNav="staff" breadcrumb={t.staff.title}>
        <div className="sda-content">
          {/* ── Cabeçalho ── */}
          <header className="sda-pagehead">
            <div className="sda-pagehead__meta">
              <h1 className="sd-display sd-display--sm sd-display--upright">
                {t.staff.title}
              </h1>
              <p className="sd-muted sd-small">{t.staff.subtitle}</p>
            </div>
            <button
              className="sd-btn sd-btn--primary"
              type="button"
              onClick={() => setCreateOpen(true)}
              disabled={isLoading}
              aria-label={t.staff.create}
            >
              <Plus size={16} aria-hidden="true" />
              Novo membro
            </button>
          </header>

          {/* ── Abas ── */}
          <div style={{ marginBottom: 'var(--space-6)' }}>
            <div className="sd-tabs" role="tablist" aria-label="Status da equipe">
              <button
                className={`sd-tabs__tab${isPendingTab ? ' sd-tabs__tab--active' : ''}`}
                type="button"
                role="tab"
                aria-selected={isPendingTab}
                aria-controls="staff-panel"
                onClick={() => setActiveTab(TABS.PENDING)}
              >
                {t.staff.tabPending}
                {pendingUsers.length > 0 && (
                  <span
                    className="sd-badge"
                    style={{ marginLeft: 'var(--space-2)' }}
                    aria-label={`${pendingUsers.length} aguardando aprovação`}
                  >
                    {pendingUsers.length}
                  </span>
                )}
              </button>
              <button
                className={`sd-tabs__tab${!isPendingTab ? ' sd-tabs__tab--active' : ''}`}
                type="button"
                role="tab"
                aria-selected={!isPendingTab}
                aria-controls="staff-panel"
                onClick={() => setActiveTab(TABS.ACTIVE)}
              >
                {t.staff.tabActive}
              </button>
            </div>
          </div>

          {/* ── Conteúdo da aba ── */}
          <div id="staff-panel" role="tabpanel">
            {isLoading && (
              <StaffSkeleton columns={isPendingTab ? PENDING_COLUMNS : ACTIVE_COLUMNS} />
            )}

            {isEmpty && (
              <StaffEmpty
                variant={isPendingTab ? 'pending' : 'active'}
                onCreate={() => setCreateOpen(true)}
              />
            )}

            {!isLoading && !isEmpty && isPendingTab && (
              <StaffPendingTable
                users={pendingUsers}
                onApprove={handleApprove}
                onReject={(target) => setConfirmTarget({ user: target, action: 'reject' })}
                isBusy={isBusy}
              />
            )}

            {!isLoading && !isEmpty && !isPendingTab && (
              <StaffActiveTable
                users={activeUsers}
                currentUserId={currentUserId}
                onDisable={(target) => setConfirmTarget({ user: target, action: 'disable' })}
                onDelete={(target) => setConfirmTarget({ user: target, action: 'delete' })}
                isBusy={isBusy}
              />
            )}
          </div>
        </div>
      </AppShell>

      {/* ── Modal de criação ── */}
      {createOpen && (
        <CreateStaffModal
          onClose={() => setCreateOpen(false)}
          onSubmit={handleCreate}
          isPending={createMutation.isPending}
        />
      )}

      {/* ── Confirmação de recusa / desativação / remoção ── */}
      {confirmTarget && (
        <StaffConfirmModal
          target={confirmTarget}
          isBusy={isBusy}
          onCancel={() => setConfirmTarget(null)}
          onConfirm={handleConfirm}
        />
      )}
    </>
  );
}

// ---- Modal de confirmação das três ações destrutivas ----
const CONFIRM_COPY = {
  reject: {
    title: 'Recusar cadastro?',
    body: 'O usuário não terá acesso ao painel.',
    danger: false,
  },
  disable: {
    title: 'Desativar membro?',
    body: 'O membro perde o acesso ao painel, mas o histórico é preservado.',
    danger: false,
  },
  delete: {
    title: 'Remover da equipe?',
    body: t.common.deleteConfirmBody,
    danger: true,
  },
};

/**
 * @param {{
 *   target: { user: object, action: 'reject' | 'disable' | 'delete' },
 *   isBusy: boolean,
 *   onCancel: () => void,
 *   onConfirm: () => void,
 * }} props
 */
function StaffConfirmModal({ target, isBusy, onCancel, onConfirm }) {
  const copy = CONFIRM_COPY[target.action];

  return (
    <ConfirmModal
      title={copy.title}
      itemName={target.user.email}
      body={<p className="sd-small">{copy.body}</p>}
      warning={copy.danger ? t.common.deleteConfirmBody : undefined}
      isDanger={copy.danger}
      isBusy={isBusy}
      onCancel={onCancel}
      onConfirm={onConfirm}
    />
  );
}

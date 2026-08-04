// src/features/programmings/ProgrammingsPage.jsx
// Página de programações — listagem com tabela.

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Copy, Trash2, Pencil } from 'lucide-react';
import toast from 'react-hot-toast';
import AppShell from '../../app/AppShell.jsx';
import t from '../../i18n/pt-BR.js';
import { useProgrammingsPage, useDeleteProgramming, useDuplicateProgramming } from '../../hooks/useProgrammings.js';
import { useProgrammingImpact, useCascades } from '../../hooks/useIntegrity.js';
import { flattenSessions } from '../../utils/programmingDays.js';
import ConfirmModal from '../../components/ui/ConfirmModal.jsx';
import LoadMore from '../../components/ui/LoadMore.jsx';
import ProgrammingsSkeleton from './components/ProgrammingsSkeleton.jsx';
import ProgrammingsEmpty from './components/ProgrammingsEmpty.jsx';

export default function ProgrammingsPage() {
  const navigate = useNavigate();

  // Paginada: 20 por vez.
  const {
    programmings,
    isLoading,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
  } = useProgrammingsPage();
  const deleteMutation = useDeleteProgramming();
  const duplicateMutation = useDuplicateProgramming();

  // { programming, affectedEvents }
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [isCascading, setIsCascading] = useState(false);
  const { check: checkImpact, isChecking } = useProgrammingImpact();
  const { cascadeProgramming } = useCascades();

  function handleEdit(programming) {
    navigate(`/painel/programacoes/${programming.id}/editar`);
  }

  // Levanta o impacto antes de confirmar: o usuário precisa saber
  // quantos eventos ficarão sem programação.
  async function handleDeleteRequest(programming) {
    try {
      const affectedEvents = await checkImpact(programming.id);
      setDeleteTarget({ programming, affectedEvents });
    } catch (error) {
      toast.error(error.message || 'Erro ao verificar eventos vinculados');
    }
  }

  async function handleDeleteConfirm() {
    if (!deleteTarget?.programming?.id) return;
    const { programming } = deleteTarget;

    setIsCascading(true);
    try {
      const affected = await cascadeProgramming(programming.id);
      await deleteMutation.mutateAsync(programming.id);

      setDeleteTarget(null);
      toast.success(
        affected > 0
          ? `Programação excluída e desvinculada de ${affected} evento${affected !== 1 ? 's' : ''}.`
          : 'Programação excluída com sucesso!',
      );
    } catch (error) {
      toast.error(error.message || 'Erro ao excluir programação');
    } finally {
      setIsCascading(false);
    }
  }

  function handleDuplicate(programming) {
    duplicateMutation.mutate(programming.id, {
      onSuccess: () => {
        toast.success(`Programação duplicada: ${programming.name} (cópia)`);
      },
      onError: (error) => {
        toast.error(error.message || 'Erro ao duplicar programação');
      },
    });
  }

  const isEmpty = programmings.length === 0 && !isLoading;

  return (
    <>
      <AppShell activeNav="schedules" breadcrumb={t.schedules.title}>
        <div className="sda-content">
          {/* ── Cabeçalho da página ── */}
          <header className="sda-pagehead">
            <div className="sda-pagehead__meta">
              <h1 className="sd-display sd-display--sm sd-display--upright">
                Programações
              </h1>
              <p className="sd-muted sd-small">Gerencie as programações de sessões do evento</p>
            </div>
            <button
              className="sd-btn sd-btn--primary"
              type="button"
              onClick={() => navigate('/painel/programacoes/novo')}
              disabled={isLoading}
              aria-label="Criar programação"
            >
              <Plus size={16} aria-hidden="true" />
              Nova programação
            </button>
          </header>

          {/* ── Loading ── */}
          {isLoading && <ProgrammingsSkeleton />}

          {/* ── Empty state ── */}
          {isEmpty && (
            <ProgrammingsEmpty onCreate={() => navigate('/painel/programacoes/novo')} />
          )}

          {/* ── Tabela ── */}
          {!isEmpty && (
            <table className="sda-table">
              <thead>
                <tr>
                  <th scope="col">Nome</th>
                  <th scope="col">Nº de sessões</th>
                  <th scope="col">
                    <span className="sr-only">Ações</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {programmings.map((programming) => (
                  <tr key={programming.id} className="sda-table__row">
                    <td>{programming.name}</td>
                    <td>{flattenSessions(programming).length}</td>
                    <td className="sda-table__actions">
                      <button
                        className="sd-btn sd-btn--ghost sd-btn--sm"
                        type="button"
                        onClick={() => handleEdit(programming)}
                        aria-label={`${t.common.edit} ${programming.name}`}
                        title={t.common.edit}
                      >
                        <Pencil size={15} style={{ color: 'var(--teal-600)' }} aria-hidden="true" />
                      </button>
                      <button
                        className="sd-btn sd-btn--ghost sd-btn--sm"
                        type="button"
                        onClick={() => handleDuplicate(programming)}
                        aria-label={`Duplicar ${programming.name}`}
                        title="Duplicar"
                      >
                        <Copy size={15} style={{ color: 'var(--teal-600)' }} aria-hidden="true" />
                      </button>
                      <button
                        className="sd-btn sd-btn--ghost sd-btn--sm"
                        type="button"
                        onClick={() => handleDeleteRequest(programming)}
                        disabled={isChecking}
                        aria-label={`${t.common.delete} ${programming.name}`}
                        title={t.common.delete}
                      >
                        <Trash2 size={15} style={{ color: 'var(--danger)' }} aria-hidden="true" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {/* ── Paginação ── */}
          {!isEmpty && (
            <LoadMore
              hasNextPage={hasNextPage}
              isFetchingNextPage={isFetchingNextPage}
              onLoadMore={fetchNextPage}
              label="Carregar mais programações"
            />
          )}
        </div>
      </AppShell>

      {/* ── Delete confirm modal, com aviso de impacto ── */}
      {deleteTarget && (
        <ConfirmModal
          title="Excluir programação?"
          itemName={deleteTarget.programming.name}
          body={
            deleteTarget.affectedEvents.length > 0 ? (
              <>
                <p className="sd-small">
                  <strong>{deleteTarget.affectedEvents.length}</strong> evento
                  {deleteTarget.affectedEvents.length !== 1 ? 's ficarão' : ' ficará'} sem
                  programação vinculada:
                </p>
                <ul style={{ margin: 'var(--space-2) 0 0', paddingLeft: 'var(--space-5)' }}>
                  {deleteTarget.affectedEvents.map((event) => (
                    <li key={event.id} className="sd-small sd-muted">
                      {event.headline}
                    </li>
                  ))}
                </ul>
              </>
            ) : (
              <p className="sd-small sd-muted">Nenhum evento está vinculado a esta programação.</p>
            )
          }
          warning={t.common.deleteConfirmBody}
          isBusy={isCascading || deleteMutation.isPending}
          onCancel={() => setDeleteTarget(null)}
          onConfirm={handleDeleteConfirm}
        />
      )}
    </>
  );
}

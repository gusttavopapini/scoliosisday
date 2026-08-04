// src/features/collaborators/CollaboratorsPage.jsx
// Página de colaboradores — Fase 2.
// Três estados: loading (skeleton) | empty (CTA) | data (tabela real).
// Dados carregados do Firestore via hook useCollaborators (TanStack Query).

import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Filter, SearchX } from 'lucide-react';
import toast from 'react-hot-toast';
import AppShell from '../../app/AppShell.jsx';
import t from '../../i18n/pt-BR.js';
import { COLLABORATOR_TYPES } from '../../utils/constants.js';
import { useCollaboratorsPage, useDeleteCollaborator } from '../../hooks/useCollaborators.js';
import { useCollaboratorUsages } from '../../hooks/useIntegrity.js';
import ConfirmModal from '../../components/ui/ConfirmModal.jsx';
import LoadMore from '../../components/ui/LoadMore.jsx';
import ReferenceBlockedModal from '../../components/ui/ReferenceBlockedModal.jsx';
import { filterCollaborators } from './mock.js';
import CollaboratorsSkeleton from './components/CollaboratorsSkeleton.jsx';
import CollaboratorsEmpty from './components/CollaboratorsEmpty.jsx';
import CollaboratorsTable from './components/CollaboratorsTable.jsx';

// Tipos disponíveis no filtro de dropdown
const TYPE_FILTER_OPTIONS = [
  { value: '',                                 label: t.common.allTypes },
  { value: COLLABORATOR_TYPES.SPEAKER,         label: t.collaboratorType.speaker },
  { value: COLLABORATOR_TYPES.SCIENTIFIC_CURATOR, label: t.collaboratorType.scientific_curator },
  { value: COLLABORATOR_TYPES.ORGANIZER,       label: t.collaboratorType.organizer },
];

// ---- Main page ----
export default function CollaboratorsPage() {
  const navigate = useNavigate();

  // Hooks de dados e mutações. A lista vem do servidor em blocos de 20; a
  // paginação de 5 abaixo navega dentro do que já foi carregado.
  const {
    collaborators,
    isLoading,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
  } = useCollaboratorsPage();
  const deleteCollaboratorMutation = useDeleteCollaborator();

  // Filtros de busca e tipo
  const [search,     setSearch]     = useState('');
  const [typeFilter, setTypeFilter] = useState('');

  // Paginação
  const [page, setPage] = useState(1);
  const perPage = 5;

  // Modal de exclusão e bloqueio por integridade referencial
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [blockedTarget, setBlockedTarget] = useState(null);
  const { check: checkUsages, isChecking } = useCollaboratorUsages();

  // Dados filtrados + paginação
  const filtered = useMemo(
    () => filterCollaborators(collaborators, { search, type: typeFilter }),
    [collaborators, search, typeFilter],
  );

  const totalPages = Math.max(1, Math.ceil(filtered.length / perPage));
  const pageData   = filtered.slice((page - 1) * perPage, page * perPage);

  function handleSearch(e) {
    setSearch(e.target.value);
    setPage(1);
  }

  function handleTypeFilter(e) {
    setTypeFilter(e.target.value);
    setPage(1);
  }

  function handleEdit(collaborator) {
    navigate(`/painel/colaboradores/${collaborator.id}/editar`);
  }

  // Verifica os vínculos antes de abrir a confirmação: nada de
  // confirmar para só então descobrir que a exclusão é impossível.
  async function handleDeleteRequest(collaborator) {
    try {
      const usages = await checkUsages(collaborator.id);
      if (usages.total > 0) {
        setBlockedTarget({ collaborator, usages });
        return;
      }
      setDeleteTarget(collaborator);
    } catch (error) {
      toast.error(error.message || 'Erro ao verificar vínculos do colaborador');
    }
  }

  function handleDeleteConfirm() {
    if (deleteTarget?.id) {
      deleteCollaboratorMutation.mutate(deleteTarget.id, {
        onSuccess: () => {
          setDeleteTarget(null);
          toast.success('Colaborador excluído com sucesso!');
        },
        onError: (error) => toast.error(error.message || 'Erro ao excluir colaborador'),
      });
    }
  }

  // ---- Render ----
  const isEmpty = collaborators.length === 0 && !isLoading;

  return (
    <>
      <AppShell activeNav="collaborators" breadcrumb={t.collaborators.title}>

        <div className="sda-content">
          {/* ── Cabeçalho da página ── */}
          <header className="sda-pagehead">
            <div className="sda-pagehead__meta">
              <h1 className="sd-display sd-display--sm sd-display--upright">
                {t.collaborators.title}
              </h1>
              <p className="sd-muted sd-small">{t.collaborators.subtitle}</p>
            </div>
            <button
              className="sd-btn sd-btn--primary"
              type="button"
              onClick={() => navigate('/painel/colaboradores/novo')}
              disabled={isLoading}
              aria-label={t.collaborators.create}
            >
              <Plus size={16} aria-hidden="true" />
              {t.collaborators.create}
            </button>
          </header>

          {/* ── Toolbar (busca + filtro) — sempre visível, mesmo sem resultado ── */}
          <div className="sda-toolbar" role="search" aria-label="Filtros de colaboradores">
              <label className="sd-field sda-toolbar__search">
                <span className="sr-only">{t.collaborators.searchPlaceholder}</span>
                <span
                  className="sd-input-icon"
                  aria-hidden="true"
                  style={{ position: 'relative', display: 'flex', alignItems: 'center' }}
                >
                  {search ? (
                    <button
                      type="button"
                      onClick={() => { setSearch(''); setPage(1); }}
                      aria-label="Limpar busca"
                      style={{
                        position: 'absolute',
                        right: 'var(--space-3)',
                        background: 'none',
                        border: 'none',
                        padding: 0,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'var(--text-muted)',
                      }}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        aria-hidden="true"
                      >
                        <path d="M18 6l-12 12"></path>
                        <path d="M6 6l12 12"></path>
                      </svg>
                    </button>
                  ) : (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="lucide lucide-search"
                      aria-hidden="true"
                      style={{
                        position: 'absolute',
                        right: 'var(--space-3)',
                        color: 'var(--text-muted)',
                        pointerEvents: 'none',
                      }}
                    >
                      <path d="m21 21-4.34-4.34"></path>
                      <circle cx="11" cy="11" r="8"></circle>
                    </svg>
                  )}
                  <input
                    className="sd-input"
                    placeholder="Buscar por nome…"
                    aria-label="Buscar por nome…"
                    type="search"
                    value={search}
                    onChange={handleSearch}
                    disabled={isLoading}
                    style={{ paddingLeft: 'var(--space-3)' }}
                  />
                </span>
              </label>

              <label className="sd-field">
                <span className="sr-only">{t.collaborators.filterByType}</span>
                <span className="sd-select-wrap">
                  <select
                    className="sd-select"
                    value={typeFilter}
                    onChange={handleTypeFilter}
                    disabled={isLoading}
                    aria-label={t.collaborators.filterByType}
                  >
                    {TYPE_FILTER_OPTIONS.map(({ value, label }) => (
                      <option key={value} value={value}>{label}</option>
                    ))}
                  </select>
                </span>
              </label>

              {(search || typeFilter) && (
                <button
                  className="sd-btn sd-btn--ghost sd-btn--sm"
                  type="button"
                  onClick={() => { setSearch(''); setTypeFilter(''); setPage(1); }}
                  title="Limpar filtros"
                >
                  <Filter size={15} aria-hidden="true" /> Limpar
                </button>
              )}
            </div>

          {/* ── Contagem de resultados (apenas com filtro ativo) ── */}
          {(search || typeFilter) && (
            <p
              className="sd-small sd-muted"
              style={{ marginBottom: 'var(--space-4)' }}
              aria-live="polite"
              aria-atomic="true"
            >
              {filtered.length === 0
                ? t.common.noResults
                : `${filtered.length} colaborador${filtered.length !== 1 ? 'es' : ''} encontrado${filtered.length !== 1 ? 's' : ''}`}
            </p>
          )}

          {/* ── Estado: Carregando ── */}
          {isLoading && <CollaboratorsSkeleton />}

          {/* ── Estado: Vazio ── */}
          {isEmpty && (
            <CollaboratorsEmpty onCreate={() => navigate('/painel/colaboradores/novo')} />
          )}

          {/* ── Estado: filtros não bateram com nada ── */}
          {!isEmpty && filtered.length === 0 && (
            <div className="sda-empty" role="status" aria-label="Nenhum colaborador encontrado">
              <span className="sd-icon-badge sd-icon-badge--lg sd-icon-badge--teal-soft" aria-hidden="true">
                <SearchX size={32} />
              </span>
              <h2 className="sd-display sd-display--sm sd-display--upright">Nenhum colaborador encontrado</h2>
              <p className="sd-muted">Nenhum colaborador corresponde aos filtros selecionados.</p>
              <button
                className="sd-btn sd-btn--primary"
                type="button"
                onClick={() => { setSearch(''); setTypeFilter(''); setPage(1); }}
              >
                <Filter size={16} aria-hidden="true" />
                Limpar filtros
              </button>
            </div>
          )}

          {/* ── Estado: Com dados ── */}
          {filtered.length > 0 && (
            <>
              <CollaboratorsTable
                collaborators={pageData}
                onEdit={handleEdit}
                onDelete={handleDeleteRequest}
                isBusy={isChecking}
              />

              {/* ── Paginação ── */}
              {totalPages > 1 && (
                <nav
                  className="sda-pagination"
                  aria-label="Páginas de colaboradores"
                >
                  <button
                    className="sda-pagination__btn"
                    type="button"
                    onClick={() => setPage((p) => p - 1)}
                    disabled={page === 1}
                    aria-label="Página anterior"
                  >
                    ‹
                  </button>

                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                    <button
                      key={p}
                      className={`sda-pagination__btn${page === p ? ' sda-pagination__btn--active' : ''}`}
                      type="button"
                      onClick={() => setPage(p)}
                      aria-current={page === p ? 'page' : undefined}
                    >
                      {p}
                    </button>
                  ))}

                  <button
                    className="sda-pagination__btn"
                    type="button"
                    onClick={() => setPage((p) => p + 1)}
                    disabled={page === totalPages}
                    aria-label="Próxima página"
                  >
                    ›
                  </button>

                  <span className="sda-pagination__info">
                    {(page - 1) * perPage + 1}–{Math.min(page * perPage, filtered.length)} de {filtered.length}
                  </span>
                </nav>
              )}

              {/* ── Busca a próxima página no servidor ── */}
              <LoadMore
                hasNextPage={hasNextPage}
                isFetchingNextPage={isFetchingNextPage}
                onLoadMore={fetchNextPage}
                label="Carregar mais colaboradores"
              />
            </>
          )}
        </div>
      </AppShell>

      {/* ── Modal de exclusão (portado fora do shell) ── */}
      {deleteTarget && (
        <ConfirmModal
          title={t.common.deleteConfirmTitle.replace('{name}', deleteTarget.fullName)}
          itemName={deleteTarget.fullName}
          body={
            <p className="sd-small sd-muted">
              {[deleteTarget.institution, deleteTarget.city].filter(Boolean).join(' · ')}
            </p>
          }
          warning={t.common.deleteConfirmBody}
          isBusy={deleteCollaboratorMutation.isPending}
          onCancel={() => setDeleteTarget(null)}
          onConfirm={handleDeleteConfirm}
        />
      )}

      {/* ── Exclusão bloqueada por vínculos ── */}
      {blockedTarget && (
        <ReferenceBlockedModal
          title="Colaborador em uso"
          itemName={blockedTarget.collaborator.fullName}
          intro="Não é possível excluir: este colaborador está vinculado aos itens abaixo. Remova os vínculos antes de excluí-lo."
          usages={blockedTarget.usages}
          onClose={() => setBlockedTarget(null)}
        />
      )}
    </>
  );
}

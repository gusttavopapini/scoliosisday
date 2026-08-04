// src/features/sponsors/SponsorsPage.jsx
// Página de patrocinadores — listagem com busca, cards e estado vazio.

import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus } from 'lucide-react';
import toast from 'react-hot-toast';
import AppShell from '../../app/AppShell.jsx';
import t from '../../i18n/pt-BR.js';
import { useSponsorsPage, useDeleteSponsor } from '../../hooks/useSponsors.js';
import { useCascades } from '../../hooks/useIntegrity.js';
import ConfirmModal from '../../components/ui/ConfirmModal.jsx';
import LoadMore from '../../components/ui/LoadMore.jsx';
import { filterSponsors } from './mock.js';
import SponsorCard from './components/SponsorCard.jsx';
import SponsorsSkeleton from './components/SponsorsSkeleton.jsx';
import SponsorsEmpty from './components/SponsorsEmpty.jsx';

export default function SponsorsPage() {
  const navigate = useNavigate();

  // Paginada: 20 por vez. A busca age sobre o que já foi carregado.
  const { sponsors, isLoading, hasNextPage, fetchNextPage, isFetchingNextPage } = useSponsorsPage();
  const deleteSponssorMutation = useDeleteSponsor();

  const [search, setSearch] = useState('');
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [isCascading, setIsCascading] = useState(false);
  const { cascadeSponsor } = useCascades();

  const filtered = useMemo(
    () => filterSponsors(sponsors, { search }),
    [sponsors, search],
  );

  function handleSearch(e) {
    setSearch(e.target.value);
  }

  function handleEdit(sponsor) {
    navigate(`/painel/patrocinadores/${sponsor.id}/editar`);
  }

  function handleDeleteRequest(sponsor) {
    setDeleteTarget(sponsor);
  }

  // Cascata primeiro: remove o id de events.sponsors e só então apaga
  // o documento. Se a cascata falhar, o patrocinador continua existindo
  // e nenhum evento fica apontando para um documento inexistente.
  async function handleDeleteConfirm() {
    if (!deleteTarget?.id) return;

    setIsCascading(true);
    try {
      const affected = await cascadeSponsor(deleteTarget.id);
      await deleteSponssorMutation.mutateAsync(deleteTarget.id);

      setDeleteTarget(null);
      toast.success(
        affected > 0
          ? `Patrocinador excluído e removido de ${affected} evento${affected !== 1 ? 's' : ''}.`
          : 'Patrocinador excluído com sucesso!',
      );
    } catch (error) {
      toast.error(error.message || 'Erro ao excluir patrocinador');
    } finally {
      setIsCascading(false);
    }
  }

  const isEmpty = sponsors.length === 0 && !isLoading;

  return (
    <>
      <AppShell activeNav="sponsors" breadcrumb={t.sponsors.title}>
        <div className="sda-content">
          {/* ── Cabeçalho da página ── */}
          <header className="sda-pagehead">
            <div className="sda-pagehead__meta">
              <h1 className="sd-display sd-display--sm sd-display--upright">
                {t.sponsors.title}
              </h1>
              <p className="sd-muted sd-small">{t.sponsors.subtitle}</p>
            </div>
            <button
              className="sd-btn sd-btn--primary"
              type="button"
              onClick={() => navigate('/painel/patrocinadores/novo')}
              disabled={isLoading}
              aria-label={t.sponsors.create}
            >
              <Plus size={16} aria-hidden="true" />
              {t.sponsors.create}
            </button>
          </header>

          {/* ── Busca ── */}
          {!isEmpty && (
            <div className="sda-toolbar" role="search" aria-label="Busca de patrocinadores">
              <label className="sd-field sda-toolbar__search">
                <span className="sr-only">Buscar por nome…</span>
                <span
                  className="sd-input-icon"
                  aria-hidden="true"
                  style={{ position: 'relative', display: 'flex', alignItems: 'center' }}
                >
                  {search ? (
                    <button
                      type="button"
                      onClick={() => setSearch('')}
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
            </div>
          )}

          {/* ── Contagem de resultados ── */}
          {!isEmpty && search && (
            <p
              className="sd-small sd-muted"
              style={{ marginBottom: 'var(--space-4)' }}
              aria-live="polite"
              aria-atomic="true"
            >
              {filtered.length === 0
                ? t.common.noResults
                : `${filtered.length} patrocinador${filtered.length !== 1 ? 'es' : ''} encontrado${filtered.length !== 1 ? 's' : ''}`}
            </p>
          )}

          {/* ── Loading ── */}
          {isLoading && <SponsorsSkeleton />}

          {/* ── Empty state ── */}
          {isEmpty && (
            <SponsorsEmpty onCreate={() => navigate('/painel/patrocinadores/novo')} />
          )}

          {/* ── No results ── */}
          {!isEmpty && filtered.length === 0 && (
            <div
              className="sd-card"
              style={{ textAlign: 'center', padding: 'var(--space-12) var(--space-6)' }}
              role="status"
            >
              <p className="sd-muted">{t.common.noResults}</p>
            </div>
          )}

          {/* ── Grid de cards ── */}
          {!isEmpty && filtered.length > 0 && (
            <div className="sd-grid sd-grid--4" style={{ gap: 'var(--space-5)' }}>
              {filtered.map((sponsor) => (
                <SponsorCard
                  key={sponsor.id}
                  sponsor={sponsor}
                  onEdit={handleEdit}
                  onDelete={handleDeleteRequest}
                />
              ))}
            </div>
          )}

          {/* ── Paginação ── */}
          {!isEmpty && (
            <LoadMore
              hasNextPage={hasNextPage}
              isFetchingNextPage={isFetchingNextPage}
              onLoadMore={fetchNextPage}
              label="Carregar mais patrocinadores"
            />
          )}
        </div>
      </AppShell>

      {/* ── Delete confirm modal ── */}
      {deleteTarget && (
        <ConfirmModal
          title="Excluir patrocinador?"
          itemName={deleteTarget.name}
          body={
            <p className="sd-small sd-muted">
              Ele também será removido de todos os eventos que o exibem.
            </p>
          }
          warning={t.common.deleteConfirmBody}
          isBusy={isCascading || deleteSponssorMutation.isPending}
          onCancel={() => setDeleteTarget(null)}
          onConfirm={handleDeleteConfirm}
        />
      )}
    </>
  );
}

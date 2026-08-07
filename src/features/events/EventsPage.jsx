// src/features/events/EventsPage.jsx
// Página de eventos — listagem com grid, filtros e busca

import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Copy, Trash2, Share2, Filter, SearchX } from 'lucide-react';
import toast from 'react-hot-toast';
import AppShell from '../../app/AppShell.jsx';
import t from '../../i18n/pt-BR.js';
import { eventBannerUrl } from '../../utils/eventBanner.js';
import { ordinal } from '../../utils/ordinal.js';
import ConfirmModal from '../../components/ui/ConfirmModal.jsx';
import LoadMore from '../../components/ui/LoadMore.jsx';
import {
  useEventsPage,
  useCurrentEvent,
  useSetCurrentEvent,
  useClearCurrentEvent,
  useDeleteEvent,
  useDuplicateEvent,
  usePublishEvent,
} from '../../hooks/useEvents.js';
import EventsSkeleton from './components/EventsSkeleton.jsx';
import EventsEmpty from './components/EventsEmpty.jsx';

const STATUS_OPTIONS = [
  { value: 'draft', label: 'Rascunho' },
  { value: 'published', label: 'Publicado' },
  { value: 'archived', label: 'Arquivado' },
];

// Alinhado ao eventSchema, que fixa modality em z.literal('hybrid'):
// todo evento do Scoliosis Day é híbrido (presencial + online).
const MODALITY_OPTIONS = [
  { value: 'hybrid', label: 'Híbrido' },
];

export default function EventsPage() {
  const navigate = useNavigate();
  // Paginada: 20 por vez. A busca e os filtros abaixo agem sobre o que já
  // foi carregado — não são consulta ao servidor.
  const { events: pagedEvents, isLoading, hasNextPage, fetchNextPage, isFetchingNextPage } =
    useEventsPage();

  // Buscado à parte: o evento atual encabeça a lista mesmo que, pela ordem de
  // createdAt, ele só apareceria em uma página posterior.
  const { data: currentEvent = null } = useCurrentEvent();

  const deleteEvent = useDeleteEvent();
  const duplicateEvent = useDuplicateEvent();
  const publishEvent = usePublishEvent();
  const setCurrentEvent = useSetCurrentEvent();
  const clearCurrentEvent = useClearCurrentEvent();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [deleteTarget, setDeleteTarget] = useState(null);
  // Id do evento cujo switch está gravando. Enquanto houver um, todos os
  // switches ficam desabilitados: duas trocas simultâneas disputariam a
  // invariante de "só um atual".
  const [togglingId, setTogglingId] = useState(null);

  // O atual entra no topo e é removido do resto, para não duplicar quando a
  // página que o contém também for carregada.
  const events = useMemo(() => {
    if (!currentEvent) return pagedEvents;
    return [currentEvent, ...pagedEvents.filter((event) => event.id !== currentEvent.id)];
  }, [currentEvent, pagedEvents]);

  const filtered = useMemo(() => {
    return events.filter((event) => {
      const matchesSearch = !searchQuery || event.headline.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = !statusFilter || event.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [events, searchQuery, statusFilter]);

  function handleEdit(event) {
    navigate(`/painel/eventos/${event.id}/editar`);
  }

  function handleDuplicate(event) {
    duplicateEvent.mutate(event.id, {
      onSuccess: () => {
        toast.success(`Edição duplicada: ${event.headline} (cópia)`);
      },
      onError: (error) => {
        toast.error(error.message || 'Erro ao duplicar edição');
      },
    });
  }

  function handlePublish(event) {
    publishEvent.mutate(event.id, {
      onSuccess: () => {
        toast.success(event.status === 'published' ? 'Edição despublicada' : 'Edição publicada!');
      },
      onError: (error) => {
        toast.error(error.message || 'Erro ao publicar edição');
      },
    });
  }

  // Ligar troca o destaque (setCurrentEvent desmarca o anterior no mesmo
  // batch); desligar apenas remove o destaque, sem eleger outro.
  async function handleToggleCurrent(event, isChecked) {
    setTogglingId(event.id);
    try {
      if (isChecked) {
        await setCurrentEvent.mutateAsync(event.id);
        toast.success(`${event.headline} agora é a edição atual`);
      } else {
        await clearCurrentEvent.mutateAsync(event.id);
        toast.success(`${event.headline} não é mais a edição atual`);
      }
    } catch (error) {
      toast.error(error.message || 'Erro ao alterar a edição atual');
    } finally {
      setTogglingId(null);
    }
  }

  function handleDeleteConfirm() {
    if (deleteTarget?.id) {
      deleteEvent.mutate(deleteTarget.id, {
        onSuccess: () => {
          setDeleteTarget(null);
          toast.success('Edição excluída com sucesso!');
        },
        onError: (error) => {
          toast.error(error.message || 'Erro ao excluir edição');
        },
      });
    }
  }

  // Coleção realmente vazia — nenhum evento existe ainda, os filtros não têm
  // o que filtrar. É o único caso em que o CTA "criar o primeiro" faz sentido.
  const hasNoEvents = events.length === 0 && !isLoading;
  // Há eventos, mas a combinação de filtros ativos não bateu com nenhum. Os
  // filtros continuam visíveis aqui — é para isso que servem: o usuário
  // precisa vê-los para poder mudar ou limpar a seleção.
  const hasNoFilterMatches = events.length > 0 && filtered.length === 0;
  const hasActiveFilters = Boolean(searchQuery || statusFilter);

  function handleClearFilters() {
    setSearchQuery('');
    setStatusFilter('');
  }

  return (
    <>
      <AppShell activeNav="events" breadcrumb={t.nav.events}>
        <div className="sda-content">
          {/* ── Cabeçalho ── */}
          <header className="sda-pagehead">
            <div className="sda-pagehead__meta">
              <h1 className="sd-display sd-display--sm sd-display--upright">Edições</h1>
              <p className="sd-muted sd-small">Gestão completa de edições</p>
            </div>
            <button
              className="sd-btn sd-btn--primary"
              type="button"
              onClick={() => navigate('/painel/eventos/novo')}
              disabled={isLoading}
              aria-label="Criar edição"
            >
              <Plus size={16} aria-hidden="true" />
              Nova edição
            </button>
          </header>

          {/* ── Filtros e Busca — sempre visíveis, mesmo sem resultado ──
              Sem filtro de Modalidade: eventSchema fixa modality em
              z.literal('hybrid') (ver MODALITY_OPTIONS acima), então toda
              edição é sempre híbrida — o filtro nunca excluía nada, só
              oferecia "Todas"/"Híbrido" como opções equivalentes. */}
          <div className="sd-card" style={{ marginBottom: 'var(--space-6)' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 'var(--space-4)' }}>
              <label className="sd-field">
                <span className="sd-label">Buscar por headline</span>
                <input
                  className="sd-input"
                  type="text"
                  placeholder="Digite para filtrar..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </label>

              <label className="sd-field">
                <span className="sd-label">Status</span>
                <span className="sd-select-wrap">
                  <select
                    className="sd-select"
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                  >
                    <option value="">Todos</option>
                    {STATUS_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </span>
              </label>
            </div>

            {hasActiveFilters && (
              <button
                className="sd-btn sd-btn--ghost sd-btn--sm"
                type="button"
                onClick={handleClearFilters}
                style={{ marginTop: 'var(--space-4)' }}
              >
                <Filter size={15} aria-hidden="true" /> Limpar filtros
              </button>
            )}
          </div>

          {/* ── Loading ── */}
          {isLoading && <EventsSkeleton />}

          {/* ── Empty state: nenhum evento existe ── */}
          {hasNoEvents && (
            <EventsEmpty onCreate={() => navigate('/painel/eventos/novo')} />
          )}

          {/* ── Empty state: filtros não bateram com nada ── */}
          {hasNoFilterMatches && (
            <div className="sda-empty" role="status" aria-label="Nenhuma edição encontrada">
              <span className="sd-icon-badge sd-icon-badge--lg sd-icon-badge--teal-soft" aria-hidden="true">
                <SearchX size={32} />
              </span>
              <h2 className="sd-display sd-display--sm sd-display--upright">Nenhuma edição encontrada</h2>
              <p className="sd-muted">Nenhuma edição corresponde aos filtros selecionados.</p>
              <button className="sd-btn sd-btn--primary" type="button" onClick={handleClearFilters}>
                <Filter size={16} aria-hidden="true" />
                Limpar filtros
              </button>
            </div>
          )}

          {/* ── Grid de eventos ── */}
          {filtered.length > 0 && (
            <div className="sd-grid sd-grid--3">
              {filtered.map((event) => (
                <article
                  key={event.id}
                  className="sd-card"
                  style={{ display: 'flex', flexDirection: 'column', cursor: 'pointer' }}
                  onClick={() => handleEdit(event)}
                >
                  {/* Miniatura do banner */}
                  {eventBannerUrl(event) && (
                    <img
                      src={eventBannerUrl(event)}
                      alt={event.headline}
                      style={{
                        width: '100%',
                        height: '180px',
                        objectFit: 'cover',
                        borderRadius: 'var(--radius-md)',
                        marginBottom: 'var(--space-3)',
                      }}
                    />
                  )}

                  {/* Headline */}
                  <h3 className="sd-subtitle" style={{ marginBottom: 'var(--space-2)' }}>
                    {event.headline}
                  </h3>

                  {/* Badges */}
                  <div style={{ display: 'flex', gap: 'var(--space-2)', marginBottom: 'var(--space-3)', flexWrap: 'wrap' }}>
                    <span
                      className="sd-badge"
                      style={{
                        backgroundColor:
                          event.status === 'published'
                            ? 'var(--teal-600)'
                            : event.status === 'archived'
                              ? 'var(--gray-400)'
                              : 'var(--gray-200)',
                        color: event.status === 'published' ? 'white' : 'var(--text-body)',
                      }}
                    >
                      {STATUS_OPTIONS.find((s) => s.value === event.status)?.label || 'Rascunho'}
                    </span>
                    <span className="sd-badge" style={{ backgroundColor: 'var(--teal-050)', color: 'var(--teal-600)' }}>
                      {MODALITY_OPTIONS.find((m) => m.value === event.modality)?.label || 'Híbrido'}
                    </span>
                    {typeof event.editionNumber === 'number' && (
                      <span className="sd-tag sd-tag--orange">
                        {ordinal(event.editionNumber, 'pt-BR')} Edição
                      </span>
                    )}
                    {event.isCurrent && (
                      <span className="sd-tag sd-tag--solid">Atual</span>
                    )}
                  </div>

                  {/* Switch de edição atual. stopPropagation porque o card
                      inteiro navega para a edição de conteúdo ao ser
                      clicado (mesma palavra, dois sentidos diferentes aqui:
                      "edição" do Scoliosis Day vs. "editar" o formulário). */}
                  <div
                    style={{ marginBottom: 'var(--space-3)' }}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <label className="sda-switch">
                      <input
                        type="checkbox"
                        checked={!!event.isCurrent}
                        disabled={togglingId !== null}
                        onChange={(e) => handleToggleCurrent(event, e.target.checked)}
                      />
                      <span className="sda-switch__track" aria-hidden="true" />
                      <span className="sda-switch__label">Edição atual</span>
                    </label>
                  </div>

                  {/* Data de atualização */}
                  <p className="sd-small sd-muted" style={{ marginBottom: 'var(--space-4)', marginTop: 'auto' }}>
                    Atualizado: {event.updatedAt?.toDate?.().toLocaleDateString?.('pt-BR') || 'N/A'}
                  </p>

                  {/* Ações */}
                  <div
                    style={{
                      display: 'flex',
                      gap: 'var(--space-2)',
                      paddingTop: 'var(--space-3)',
                      borderTop: '1px solid var(--border)',
                    }}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <button
                      className="sd-btn sd-btn--ghost sd-btn--sm"
                      type="button"
                      onClick={() => handleEdit(event)}
                      title="Editar"
                      aria-label="Editar edição"
                    >
                      <span style={{ color: 'var(--teal-600)', fontSize: '16px' }}>✎</span>
                    </button>
                    <button
                      className="sd-btn sd-btn--ghost sd-btn--sm"
                      type="button"
                      onClick={() => handleDuplicate(event)}
                      title="Duplicar"
                      aria-label="Duplicar edição"
                    >
                      <Copy size={15} style={{ color: 'var(--teal-600)' }} aria-hidden="true" />
                    </button>
                    <button
                      className="sd-btn sd-btn--ghost sd-btn--sm"
                      type="button"
                      onClick={() => handlePublish(event)}
                      title={event.status === 'published' ? 'Despublicar' : 'Publicar'}
                      aria-label={event.status === 'published' ? 'Despublicar' : 'Publicar'}
                    >
                      <Share2
                        size={15}
                        style={{ color: event.status === 'published' ? 'var(--teal-600)' : 'var(--gray-400)' }}
                        aria-hidden="true"
                      />
                    </button>
                    <button
                      className="sd-btn sd-btn--ghost sd-btn--sm"
                      type="button"
                      onClick={() => setDeleteTarget(event)}
                      title="Excluir"
                      aria-label="Excluir edição"
                    >
                      <Trash2 size={15} style={{ color: 'var(--danger)' }} aria-hidden="true" />
                    </button>
                  </div>
                </article>
              ))}
            </div>
          )}

          {/* ── Paginação ── */}
          {!hasNoEvents && filtered.length > 0 && (
            <LoadMore
              hasNextPage={hasNextPage}
              isFetchingNextPage={isFetchingNextPage}
              onLoadMore={fetchNextPage}
              label="Carregar mais edições"
            />
          )}
        </div>
      </AppShell>

      {/* ── Delete confirm modal ── */}
      {deleteTarget && (
        <ConfirmModal
          title="Excluir edição?"
          itemName={deleteTarget.headline}
          warning={t.common.deleteConfirmBody}
          isBusy={deleteEvent.isPending}
          onCancel={() => setDeleteTarget(null)}
          onConfirm={handleDeleteConfirm}
        />
      )}
    </>
  );
}

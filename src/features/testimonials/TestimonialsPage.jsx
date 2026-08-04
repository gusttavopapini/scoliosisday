// src/features/testimonials/TestimonialsPage.jsx
// Listagem de depoimentos — duas abas (Textuais/Vídeos), mesma tabela.
// Módulo independente do array `testimonials` embutido em cada evento.

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus } from 'lucide-react';
import toast from 'react-hot-toast';
import AppShell from '../../app/AppShell.jsx';
import t from '../../i18n/pt-BR.js';
import { TESTIMONIAL_TYPES } from '../../utils/constants.js';
import { useTestimonials, useDeleteTestimonial } from '../../hooks/useTestimonials.js';
import ConfirmModal from '../../components/ui/ConfirmModal.jsx';
import TestimonialsSkeleton from './components/TestimonialsSkeleton.jsx';
import TestimonialsEmpty from './components/TestimonialsEmpty.jsx';
import TestimonialsTable from './components/TestimonialsTable.jsx';

export default function TestimonialsPage() {
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState(TESTIMONIAL_TYPES.TEXT);
  const [deleteTarget, setDeleteTarget] = useState(null);

  // Busca só a aba ativa — query própria por type (where + orderBy + limit),
  // não a coleção inteira filtrada no cliente. Trocar de aba busca de novo,
  // mas cada resultado fica em cache por 5min (staleTime global).
  const { data: visibleTestimonials = [], isLoading, error } = useTestimonials(activeTab);
  if (error) console.error('[TestimonialsPage] Falha ao buscar depoimentos:', error);
  const deleteMutation = useDeleteTestimonial();

  const isTextTab = activeTab === TESTIMONIAL_TYPES.TEXT;
  const isEmpty = !isLoading && visibleTestimonials.length === 0;

  function handleCreate() {
    navigate(`/painel/depoimentos/novo?type=${activeTab}`);
  }

  function handleEdit(testimonial) {
    navigate(`/painel/depoimentos/${testimonial.id}/editar`);
  }

  function handleDeleteConfirm() {
    if (!deleteTarget?.id) return;
    deleteMutation.mutate(deleteTarget.id, {
      onSuccess: () => {
        setDeleteTarget(null);
        toast.success(t.testimonials.deleteSuccess);
      },
      onError: (error) => toast.error(error.message || 'Erro ao excluir depoimento'),
    });
  }

  return (
    <>
      <AppShell activeNav="testimonials" breadcrumb={t.testimonials.title}>
        <div className="sda-content">
          {/* ── Cabeçalho ── */}
          <header className="sda-pagehead">
            <div className="sda-pagehead__meta">
              <h1 className="sd-display sd-display--sm sd-display--upright">
                {t.testimonials.title}
              </h1>
              <p className="sd-muted sd-small">{t.testimonials.subtitle}</p>
            </div>
            <button
              className="sd-btn sd-btn--primary"
              type="button"
              onClick={handleCreate}
              disabled={isLoading}
              aria-label={t.testimonials.create}
            >
              <Plus size={16} aria-hidden="true" />
              {t.testimonials.create}
            </button>
          </header>

          {/* ── Abas ── */}
          <div style={{ marginBottom: 'var(--space-6)' }}>
            <div className="sd-tabs" role="tablist" aria-label="Tipo de depoimento">
              <button
                className={`sd-tabs__tab${isTextTab ? ' sd-tabs__tab--active' : ''}`}
                type="button"
                role="tab"
                aria-selected={isTextTab}
                aria-controls="testimonials-panel"
                onClick={() => setActiveTab(TESTIMONIAL_TYPES.TEXT)}
              >
                {t.testimonials.tabText}
              </button>
              <button
                className={`sd-tabs__tab${!isTextTab ? ' sd-tabs__tab--active' : ''}`}
                type="button"
                role="tab"
                aria-selected={!isTextTab}
                aria-controls="testimonials-panel"
                onClick={() => setActiveTab(TESTIMONIAL_TYPES.VIDEO)}
              >
                {t.testimonials.tabVideo}
              </button>
            </div>
          </div>

          {/* ── Conteúdo da aba ── */}
          <div id="testimonials-panel" role="tabpanel">
            {isLoading && <TestimonialsSkeleton />}

            {isEmpty && (
              <TestimonialsEmpty type={activeTab} onCreate={handleCreate} />
            )}

            {!isLoading && !isEmpty && (
              <TestimonialsTable
                testimonials={visibleTestimonials}
                onEdit={handleEdit}
                onDelete={setDeleteTarget}
              />
            )}
          </div>
        </div>
      </AppShell>

      {deleteTarget && (
        <ConfirmModal
          title={t.common.deleteConfirmTitle.replace('{name}', deleteTarget.name)}
          itemName={deleteTarget.name}
          warning={t.common.deleteConfirmBody}
          isBusy={deleteMutation.isPending}
          onCancel={() => setDeleteTarget(null)}
          onConfirm={handleDeleteConfirm}
        />
      )}
    </>
  );
}

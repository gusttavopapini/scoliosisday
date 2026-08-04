// src/features/testimonials/EditTestimonialPage.jsx
// Página para editar depoimento existente.

import { useParams } from 'react-router-dom';
import AppShell from '../../app/AppShell.jsx';
import t from '../../i18n/pt-BR.js';
import { useTestimonial } from '../../hooks/useTestimonials.js';
import TestimonialForm from './components/TestimonialForm.jsx';

export default function EditTestimonialPage() {
  const { id } = useParams();
  const { data: testimonial, isLoading } = useTestimonial(id);

  if (isLoading) {
    return (
      <AppShell activeNav="testimonials" breadcrumb={t.common.loading}>
        <div className="sda-content">
          <div className="sd-card" style={{ textAlign: 'center', padding: 'var(--space-12)' }}>
            <p className="sd-muted">{t.common.loading}</p>
          </div>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell activeNav="testimonials" breadcrumb="Editar depoimento">
      <div className="sda-content">
        <header className="sda-pagehead">
          <div className="sda-pagehead__meta">
            <h1 className="sd-display sd-display--sm sd-display--upright">
              Editar depoimento
            </h1>
            <p className="sd-muted sd-small">Atualize as informações do depoimento</p>
          </div>
        </header>

        <div className="sd-card">
          {testimonial && <TestimonialForm initialData={testimonial} isEditMode={true} />}
        </div>
      </div>
    </AppShell>
  );
}

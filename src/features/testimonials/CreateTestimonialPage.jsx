// src/features/testimonials/CreateTestimonialPage.jsx
// Página para criar novo depoimento.

import AppShell from '../../app/AppShell.jsx';
import t from '../../i18n/pt-BR.js';
import TestimonialForm from './components/TestimonialForm.jsx';

export default function CreateTestimonialPage() {
  return (
    <AppShell activeNav="testimonials" breadcrumb={t.testimonials.create}>
      <div className="sda-content">
        <header className="sda-pagehead">
          <div className="sda-pagehead__meta">
            <h1 className="sd-display sd-display--sm sd-display--upright">
              {t.testimonials.create}
            </h1>
            <p className="sd-muted sd-small">Adicione um depoimento textual ou em vídeo</p>
          </div>
        </header>

        <div className="sd-card">
          <TestimonialForm />
        </div>
      </div>
    </AppShell>
  );
}

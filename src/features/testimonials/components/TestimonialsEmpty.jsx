// src/features/testimonials/components/TestimonialsEmpty.jsx
// Estado vazio das abas de depoimentos.

import { Plus, MessageSquareQuote, Video } from 'lucide-react';
import t from '../../../i18n/pt-BR.js';

/** @param {{ type: 'text' | 'video', onCreate: () => void }} props */
export default function TestimonialsEmpty({ type, onCreate }) {
  const isText = type === 'text';
  const title = isText ? t.testimonials.emptyTextTitle : t.testimonials.emptyVideoTitle;
  const body = isText ? t.testimonials.emptyTextBody : t.testimonials.emptyVideoBody;
  const Icon = isText ? MessageSquareQuote : Video;

  return (
    <div className="sda-empty" role="status" aria-label={title}>
      <span className="sd-icon-badge sd-icon-badge--lg sd-icon-badge--teal-soft" aria-hidden="true">
        <Icon size={32} />
      </span>
      <h2 className="sd-display sd-display--sm sd-display--upright">{title}</h2>
      <p className="sd-muted">{body}</p>
      <button className="sd-btn sd-btn--primary" type="button" onClick={onCreate}>
        <Plus size={16} aria-hidden="true" />
        {t.testimonials.create}
      </button>
    </div>
  );
}

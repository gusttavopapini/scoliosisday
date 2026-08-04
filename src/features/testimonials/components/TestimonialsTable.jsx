// src/features/testimonials/components/TestimonialsTable.jsx
// Tabela compartilhada pelas duas abas (Textuais/Vídeos) — mesmas colunas
// nos dois tipos, só o conteúdo muda.

import { Pencil, Trash2 } from 'lucide-react';
import t from '../../../i18n/pt-BR.js';
import { formatTestimonialDate } from '../utils/formatTestimonialDate.js';

/**
 * @param {{
 *   testimonials: object[],
 *   onEdit: (testimonial: object) => void,
 *   onDelete: (testimonial: object) => void,
 * }} props
 */
export default function TestimonialsTable({ testimonials, onEdit, onDelete }) {
  return (
    <table className="sda-table">
      <thead>
        <tr>
          <th scope="col">{t.testimonials.name}</th>
          <th scope="col">{t.testimonials.role}</th>
          <th scope="col">{t.testimonials.date}</th>
          <th scope="col"><span className="sr-only">{t.common.actions}</span></th>
        </tr>
      </thead>
      <tbody>
        {testimonials.map((testimonial) => (
          <tr key={testimonial.id} className="sda-table__row">
            <td>{testimonial.name}</td>
            <td>{testimonial.role}</td>
            <td>{formatTestimonialDate(testimonial.date)}</td>
            <td className="sda-table__actions">
              <button
                className="sd-btn sd-btn--ghost sd-btn--sm"
                type="button"
                onClick={() => onEdit(testimonial)}
                aria-label={`${t.common.edit} ${testimonial.name}`}
                title={t.common.edit}
              >
                <Pencil size={15} aria-hidden="true" />
              </button>
              <button
                className="sd-btn sd-btn--ghost sd-btn--sm"
                type="button"
                onClick={() => onDelete(testimonial)}
                aria-label={`${t.common.delete} ${testimonial.name}`}
                title={t.common.delete}
              >
                <Trash2 size={15} style={{ color: 'var(--danger)' }} aria-hidden="true" />
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

// src/features/sponsors/components/SponsorCard.jsx
// Card de patrocinador com logo, nome e ações.

import { Pencil, Trash2 } from 'lucide-react';
import t from '../../../i18n/pt-BR.js';

export default function SponsorCard({ sponsor, onEdit, onDelete }) {
  return (
    <div className="sd-card" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
      {/* Logo. object-fit: contain porque logo não pode ser recortada, e o
          xadrez atrás revela transparência de PNG/SVG em vez de fingir um
          fundo branco. Sem logo, cai no rótulo cinza de antes. */}
      <div className="sdaimg-logo">
        {sponsor.logoUrl ? (
          <img className="sdaimg-logo__img" src={sponsor.logoUrl} alt={sponsor.name} />
        ) : (
          <span className="sdaimg-logo__empty">Sem logo</span>
        )}
      </div>

      {/* Nome e link */}
      <div>
        <h3 style={{ fontWeight: 'var(--fw-semibold)', color: 'var(--text-heading)', margin: 0, marginBottom: 'var(--space-2)' }}>
          {sponsor.name}
        </h3>
        <a
          href={sponsor.website}
          target="_blank"
          rel="noopener noreferrer"
          className="sd-small"
          style={{ color: 'var(--text-link)', textDecoration: 'none' }}
        >
          {sponsor.website}
        </a>
      </div>

      {/* Ações */}
      <div style={{ display: 'flex', gap: 'var(--space-2)', marginTop: 'auto' }}>
        <button
          className="sd-btn sd-btn--outline sd-btn--sm"
          type="button"
          onClick={() => onEdit(sponsor)}
          aria-label={`${t.common.edit} ${sponsor.name}`}
          title={t.common.edit}
          style={{ flex: 1 }}
        >
          <Pencil size={15} aria-hidden="true" />
          Editar
        </button>
        <button
          className="sd-btn sd-btn--outline sd-btn--danger sd-btn--sm"
          type="button"
          onClick={() => onDelete(sponsor)}
          aria-label={`${t.common.delete} ${sponsor.name}`}
          title={t.common.delete}
          style={{ flex: 1 }}
        >
          <Trash2 size={15} aria-hidden="true" />
          Excluir
        </button>
      </div>
    </div>
  );
}

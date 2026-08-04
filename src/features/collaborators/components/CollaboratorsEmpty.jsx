// src/features/collaborators/components/CollaboratorsEmpty.jsx
// Estado vazio: ilustração (sd-icon-badge) + título display + corpo + CTA.

import { Users, Plus } from 'lucide-react';
import t from '../../../i18n/pt-BR.js';

/**
 * @param {{ onCreate: () => void }} props
 */
export default function CollaboratorsEmpty({ onCreate }) {
  return (
    <div className="sda-empty" role="status" aria-label={t.collaborators.emptyTitle}>
      <span
        className="sd-icon-badge sd-icon-badge--lg sd-icon-badge--teal-soft"
        aria-hidden="true"
      >
        <Users size={32} />
      </span>

      <h2 className="sd-display sd-display--sm sd-display--upright">
        {t.collaborators.emptyTitle}
      </h2>

      <p className="sd-muted">
        {t.collaborators.emptyBody}
      </p>

      <button
        className="sd-btn sd-btn--primary"
        type="button"
        onClick={onCreate}
      >
        <Plus size={16} aria-hidden="true" />
        {t.collaborators.create}
      </button>
    </div>
  );
}

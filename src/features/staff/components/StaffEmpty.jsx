// src/features/staff/components/StaffEmpty.jsx
// Estado vazio das abas da equipe.
// A aba de pendentes não oferece CTA: não há o que criar ali.

import { UserCheck, Users, Plus } from 'lucide-react';
import t from '../../../i18n/pt-BR.js';

/**
 * @param {{ variant: 'pending' | 'active', onCreate?: () => void }} props
 */
export default function StaffEmpty({ variant, onCreate }) {
  const isPending = variant === 'pending';

  const title = isPending ? t.staff.emptyPendingTitle : t.staff.emptyActiveTitle;
  const body = isPending ? t.staff.emptyPendingBody : t.staff.emptyActiveBody;
  const Icon = isPending ? UserCheck : Users;

  return (
    <div className="sda-empty" role="status" aria-label={title}>
      <span
        className="sd-icon-badge sd-icon-badge--lg sd-icon-badge--teal-soft"
        aria-hidden="true"
      >
        <Icon size={32} />
      </span>

      <h2 className="sd-display sd-display--sm sd-display--upright">{title}</h2>

      <p className="sd-muted">{body}</p>

      {!isPending && onCreate && (
        <button className="sd-btn sd-btn--primary" type="button" onClick={onCreate}>
          <Plus size={16} aria-hidden="true" />
          {t.staff.create}
        </button>
      )}
    </div>
  );
}

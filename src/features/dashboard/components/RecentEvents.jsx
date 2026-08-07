// src/features/dashboard/components/RecentEvents.jsx
// Os 5 eventos editados mais recentemente (seção 11.1).

import { Link } from 'react-router-dom';
import { Calendar } from 'lucide-react';
import t from '../../../i18n/pt-BR.js';
import { EVENT_STATUS } from '../../../utils/constants.js';
import { toDate } from '../../../utils/formatTimestamp.js';

const STATUS_TAG_MODIFIER = {
  [EVENT_STATUS.PUBLISHED]: 'sd-tag--solid',
  [EVENT_STATUS.DRAFT]: 'sd-tag--neutral',
  [EVENT_STATUS.ARCHIVED]: 'sd-tag--neutral sd-tag--solid',
};

function formatDateTime(value) {
  const date = toDate(value);
  if (!date || Number.isNaN(date.getTime())) return '—';
  return date.toLocaleDateString('pt-BR');
}

/**
 * @param {{ events: object[], isLoading?: boolean }} props
 */
export default function RecentEvents({ events, isLoading = false }) {
  if (isLoading) {
    return (
      <div className="sd-card" aria-busy="true" aria-label="Carregando edições recentes">
        {Array.from({ length: 3 }, (_, i) => (
          <div
            key={i}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--space-4)',
              paddingTop: 'var(--space-3)',
              paddingBottom: 'var(--space-3)',
            }}
            aria-hidden="true"
          >
            <div
              className="sda-skeleton"
              style={{ height: 'var(--space-4)', width: `${40 + i * 12}%` }}
            />
          </div>
        ))}
      </div>
    );
  }

  if (events.length === 0) {
    return (
      <div className="sda-empty" role="status" aria-label={t.events.emptyTitle}>
        <span className="sd-icon-badge sd-icon-badge--lg sd-icon-badge--teal-soft" aria-hidden="true">
          <Calendar size={32} />
        </span>
        <h3 className="sd-display sd-display--sm sd-display--upright">{t.events.emptyTitle}</h3>
        <p className="sd-muted">{t.events.emptyBody}</p>
      </div>
    );
  }

  return (
    <ul className="sd-card" style={{ listStyle: 'none', margin: 0, padding: 'var(--space-2)' }}>
      {events.map((event, index) => (
        <li
          key={event.id}
          style={{
            borderTop: index === 0 ? 'none' : '1px solid var(--border)',
          }}
        >
          <Link
            to={`/painel/eventos/${event.id}/editar`}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 'var(--space-4)',
              padding: 'var(--space-4)',
              textDecoration: 'none',
              color: 'inherit',
            }}
          >
            <span style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', minWidth: 0 }}>
              <span
                className={`sd-tag ${STATUS_TAG_MODIFIER[event.status] ?? 'sd-tag--neutral'}`}
                style={{ flexShrink: 0 }}
              >
                {t.eventStatus[event.status] ?? t.eventStatus.draft}
              </span>
              <span
                style={{
                  fontWeight: 'var(--fw-semibold)',
                  color: 'var(--text-heading)',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                {event.headline}
              </span>
            </span>

            <span className="sd-small sd-muted" style={{ flexShrink: 0 }}>
              {t.common.updatedAt} {formatDateTime(event.updatedAt)}
            </span>
          </Link>
        </li>
      ))}
    </ul>
  );
}

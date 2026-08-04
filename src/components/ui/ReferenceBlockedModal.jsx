// src/components/ui/ReferenceBlockedModal.jsx
// Exclusão (ou troca de tipo) bloqueada por integridade referencial.
// Lista onde o colaborador está em uso, com link para cada lugar,
// para o usuário conseguir desfazer os vínculos.

import { Link } from 'react-router-dom';
import Modal from './Modal.jsx';
import t from '../../i18n/pt-BR.js';

/**
 * @param {{
 *   title: string,
 *   itemName: string,
 *   intro: string,
 *   usages: { events: object[], sessions: object[], total: number },
 *   onClose: () => void,
 * }} props
 */
export default function ReferenceBlockedModal({ title, itemName, intro, usages, onClose }) {
  return (
    <Modal labelledBy="reference-blocked-title" onClose={onClose}>
      <div className="sda-modal__head">
        <h2 id="reference-blocked-title">{title}</h2>
        <button
          className="sd-btn sd-btn--ghost sd-btn--sm"
          type="button"
          onClick={onClose}
          aria-label={t.common.close}
        >
          ✕
        </button>
      </div>

      <div className="sda-modal__body">
        <p style={{ fontWeight: 'var(--fw-semibold)', color: 'var(--text-heading)' }}>
          {itemName}
        </p>
        <p className="sd-muted sd-small" style={{ marginTop: 'var(--space-2)' }}>
          {intro}
        </p>

        {/* ── Eventos ── */}
        {usages.events.length > 0 && (
          <div style={{ marginTop: 'var(--space-5)' }}>
            <h3 className="sd-label">
              {t.nav.events} ({usages.events.length})
            </h3>
            <ul style={{ margin: 'var(--space-2) 0 0', paddingLeft: 'var(--space-5)' }}>
              {usages.events.map((event) => (
                <li key={event.id} style={{ marginBottom: 'var(--space-2)' }}>
                  <Link to={`/painel/eventos/${event.id}/editar`} onClick={onClose}>
                    {event.headline}
                  </Link>
                  {event.isStar && (
                    <span
                      className="sd-tag sd-tag--orange"
                      style={{ marginLeft: 'var(--space-2)' }}
                    >
                      destaque
                    </span>
                  )}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* ── Sessões de programação ── */}
        {usages.sessions.length > 0 && (
          <div style={{ marginTop: 'var(--space-5)' }}>
            <h3 className="sd-label">
              {t.schedules.sessions} ({usages.sessions.length})
            </h3>
            <ul style={{ margin: 'var(--space-2) 0 0', paddingLeft: 'var(--space-5)' }}>
              {usages.sessions.map((session, index) => (
                <li
                  key={`${session.programmingId}-${index}`}
                  style={{ marginBottom: 'var(--space-2)' }}
                >
                  <Link to={`/painel/programacoes/${session.programmingId}/editar`} onClick={onClose}>
                    {session.programmingName}
                  </Link>
                  <span className="sd-muted sd-small">
                    {' · '}
                    {session.dayLabel && `${session.dayLabel} · `}
                    {session.sessionTitle}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      <div className="sda-modal__foot">
        <button className="sd-btn sd-btn--primary" type="button" onClick={onClose}>
          Entendi
        </button>
      </div>
    </Modal>
  );
}

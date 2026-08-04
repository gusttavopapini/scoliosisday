// src/features/staff/components/StaffActiveTable.jsx
// Aba 2 — membros ativos.
// O admin logado aparece marcado como "você" e sem ações: a trava
// existe também no serviço e nas Security Rules.

import { Ban, Trash2 } from 'lucide-react';
import t from '../../../i18n/pt-BR.js';
import { formatDate } from '../utils/formatDate.js';

/**
 * @param {{
 *   users: object[],
 *   currentUserId: string | null,
 *   onDisable: (user: object) => void,
 *   onDelete: (user: object) => void,
 *   isBusy?: boolean,
 * }} props
 */
export default function StaffActiveTable({
  users,
  currentUserId,
  onDisable,
  onDelete,
  isBusy = false,
}) {
  return (
    <table className="sda-table">
      <thead>
        <tr>
          <th scope="col">{t.staff.email}</th>
          <th scope="col">{t.staff.role}</th>
          <th scope="col">Data de aprovação</th>
          <th scope="col">Último acesso</th>
          <th scope="col"><span className="sr-only">{t.common.actions}</span></th>
        </tr>
      </thead>
      <tbody>
        {users.map((user) => {
          const isSelf = user.id === currentUserId;

          return (
            <tr key={user.id} className="sda-table__row">
              <td>
                {user.email}
                {isSelf && (
                  <span className="sd-tag sd-tag--neutral" style={{ marginLeft: 'var(--space-2)' }}>
                    você
                  </span>
                )}
              </td>
              <td>{t.staffRole[user.role] ?? user.role}</td>
              <td>{formatDate(user.approvedAt)}</td>
              <td>{formatDate(user.lastLoginAt)}</td>
              <td className="sda-table__actions">
                {isSelf ? (
                  <span className="sd-small sd-muted">{t.staff.cannotEditSelf}</span>
                ) : (
                  <>
                    <button
                      className="sd-btn sd-btn--ghost sd-btn--sm"
                      type="button"
                      onClick={() => onDisable(user)}
                      disabled={isBusy}
                      aria-label={`${t.staff.disable} ${user.email}`}
                      title={t.staff.disable}
                    >
                      <Ban size={15} style={{ color: 'var(--orange-700)' }} aria-hidden="true" />
                    </button>
                    <button
                      className="sd-btn sd-btn--ghost sd-btn--sm"
                      type="button"
                      onClick={() => onDelete(user)}
                      disabled={isBusy}
                      aria-label={`${t.common.delete} ${user.email}`}
                      title={t.common.delete}
                    >
                      <Trash2 size={15} style={{ color: 'var(--danger)' }} aria-hidden="true" />
                    </button>
                  </>
                )}
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}

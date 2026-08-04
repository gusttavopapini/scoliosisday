// src/features/staff/components/StaffPendingTable.jsx
// Aba 1 — cadastros aguardando aprovação.

import { Check, X } from 'lucide-react';
import t from '../../../i18n/pt-BR.js';
import { formatDate } from '../utils/formatDate.js';

/**
 * @param {{
 *   users: object[],
 *   onApprove: (user: object) => void,
 *   onReject: (user: object) => void,
 *   isBusy?: boolean,
 * }} props
 */
export default function StaffPendingTable({ users, onApprove, onReject, isBusy = false }) {
  return (
    <table className="sda-table">
      <thead>
        <tr>
          <th scope="col">{t.staff.email}</th>
          <th scope="col">{t.staff.requestDate}</th>
          <th scope="col"><span className="sr-only">{t.common.actions}</span></th>
        </tr>
      </thead>
      <tbody>
        {users.map((user) => (
          <tr key={user.id} className="sda-table__row">
            <td>{user.email}</td>
            <td>{formatDate(user.createdAt)}</td>
            <td className="sda-table__actions">
              <button
                className="sd-btn sd-btn--primary sd-btn--sm"
                type="button"
                onClick={() => onApprove(user)}
                disabled={isBusy}
                aria-label={`${t.staff.approve} ${user.email}`}
                title={t.staff.approve}
              >
                <Check size={15} aria-hidden="true" />
                {t.staff.approve}
              </button>
              <button
                className="sd-btn sd-btn--outline sd-btn--sm"
                type="button"
                onClick={() => onReject(user)}
                disabled={isBusy}
                aria-label={`${t.staff.reject} ${user.email}`}
                title={t.staff.reject}
              >
                <X size={15} aria-hidden="true" />
                {t.staff.reject}
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

// src/features/banners/components/BannersTable.jsx
// Tabela da listagem de banners: miniatura, título, ordem, status e ações.

import { Pencil, Trash2 } from 'lucide-react';
import t from '../../../i18n/pt-BR.js';

/**
 * @param {{
 *   banners: object[],
 *   onEdit: (banner: object) => void,
 *   onDelete: (banner: object) => void,
 * }} props
 */
export default function BannersTable({ banners, onEdit, onDelete }) {
  return (
    <table className="sda-table">
      <thead>
        <tr>
          <th scope="col"><span className="sr-only">Miniatura</span></th>
          <th scope="col">{t.banners.name}</th>
          <th scope="col">{t.banners.order}</th>
          <th scope="col">{t.banners.status}</th>
          <th scope="col"><span className="sr-only">{t.common.actions}</span></th>
        </tr>
      </thead>
      <tbody>
        {banners.map((banner) => (
          <tr key={banner.id} className="sda-table__row">
            <td>
              {banner.bannerDesktopUrl ? (
                <img
                  src={banner.bannerDesktopUrl}
                  alt=""
                  style={{
                    width: 56,
                    height: 36,
                    objectFit: 'cover',
                    borderRadius: 'var(--radius-sm)',
                    display: 'block',
                  }}
                />
              ) : (
                <div
                  style={{
                    width: 56,
                    height: 36,
                    borderRadius: 'var(--radius-sm)',
                    background: 'var(--gray-100)',
                  }}
                  aria-hidden="true"
                />
              )}
            </td>
            <td>{banner.headline}</td>
            <td>{banner.order}</td>
            <td>
              <span
                className="sd-badge"
                style={{ backgroundColor: banner.active ? 'var(--success)' : 'var(--gray-400)' }}
              >
                {banner.active ? t.banners.active : t.banners.inactive}
              </span>
            </td>
            <td className="sda-table__actions">
              <button
                className="sd-btn sd-btn--ghost sd-btn--sm"
                type="button"
                onClick={() => onEdit(banner)}
                aria-label={`${t.common.edit} ${banner.headline}`}
                title={t.common.edit}
              >
                <Pencil size={15} aria-hidden="true" />
              </button>
              <button
                className="sd-btn sd-btn--ghost sd-btn--sm"
                type="button"
                onClick={() => onDelete(banner)}
                aria-label={`${t.common.delete} ${banner.headline}`}
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

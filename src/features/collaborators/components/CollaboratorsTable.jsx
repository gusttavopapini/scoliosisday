// src/features/collaborators/components/CollaboratorsTable.jsx
// Tabela de colaboradores: sda-table com avatar, tipo, instituição, data e ações.
// Ações (Editar / Excluir) aparecem no hover e disparam callbacks para o pai.

import { Pencil, Trash2 } from 'lucide-react';
import t from '../../../i18n/pt-BR.js';
import AvatarInitials from '../../../components/ui/AvatarInitials.jsx';
import { toDate } from '../../../utils/formatTimestamp.js';

const TYPE_TAG = {
  speaker:            'sd-tag sd-tag--orange',
  scientific_curator: 'sd-tag',
  organizer:          'sd-tag sd-tag--neutral',
};

/**
 * @param {{
 *   collaborators: import('../mock.js').Collaborator[],
 *   onEdit: (c: import('../mock.js').Collaborator) => void,
 *   onDelete: (c: import('../mock.js').Collaborator) => void,
 * }} props
 */
export default function CollaboratorsTable({ collaborators, onEdit, onDelete, isBusy = false }) {
  return (
    <table
      className="sda-table"
      aria-label={t.collaborators.title}
    >
      <thead>
        <tr>
          <th scope="col">{t.collaborators.name}</th>
          <th scope="col">{t.collaborators.type}</th>
          <th scope="col">Instituição</th>
          <th scope="col">{t.common.createdAt}</th>
          <th scope="col">
            <span className="sr-only">{t.common.actions}</span>
          </th>
        </tr>
      </thead>
      <tbody>
        {collaborators.map((c) => (
          <tr key={c.id} className="sda-table__row">
            {/* Nome + avatar (foto quando existe, iniciais quando não) */}
            <td>
              <div className="sda-table__person">
                <AvatarInitials
                  name={c.fullName}
                  photoUrl={c.photoUrl}
                  id={c.id}
                  className="sda-avatar"
                />
                <span>{c.fullName}</span>
              </div>
            </td>

            {/* Tipo */}
            <td>
              <span className={TYPE_TAG[c.type] ?? 'sd-tag'}>
                {t.collaboratorType[c.type]}
              </span>
            </td>

            {/* Instituição */}
            <td>
              <div>{c.institution}</div>
              <div className="sd-small sd-muted">{c.city}</div>
            </td>

            {/* Data de criação */}
            <td className="sd-muted sd-small">
              <time dateTime={toDate(c.createdAt)?.toISOString()}>
                {toDate(c.createdAt)?.toLocaleDateString('pt-BR', {
                  day: '2-digit',
                  month: '2-digit',
                  year: 'numeric',
                })}
              </time>
            </td>

            {/* Ações (aparecem no hover via sda-table__actions) */}
            <td className="sda-table__actions">
              <button
                className="sd-btn sd-btn--ghost sd-btn--sm"
                type="button"
                onClick={() => onEdit(c)}
                aria-label={`${t.common.edit} ${c.fullName}`}
                title={t.common.edit}
              >
                <Pencil size={15} aria-hidden="true" />
              </button>
              <button
                className="sd-btn sd-btn--ghost sd-btn--sm"
                type="button"
                onClick={() => onDelete(c)}
                disabled={isBusy}
                aria-label={`${t.common.delete} ${c.fullName}`}
                title={t.common.delete}
              >
                <Trash2 size={15} aria-hidden="true" />
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

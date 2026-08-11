// src/features/settings/components/SocialLinkRow.jsx
// Uma linha da lista de redes sociais (SettingsPage) — cada ação (toggle,
// mover, editar URL, excluir) persiste imediatamente no Firestore via
// callbacks do pai; este componente só cuida de apresentação e do estado
// de digitação da URL enquanto em edição.

import { ChevronDown, ChevronUp, Pencil, Check, X, Trash2 } from 'lucide-react';
import { getSocialPlatform } from '../../../utils/socialPlatforms.js';

/**
 * @param {{
 *   link: { id: string, platform: string, url: string, order: number, active: boolean },
 *   isFirst: boolean,
 *   isLast: boolean,
 *   isEditing: boolean,
 *   draftUrl: string,
 *   error?: string | null,
 *   isBusy?: boolean,
 *   onStartEdit: () => void,
 *   onChangeDraftUrl: (value: string) => void,
 *   onConfirmEdit: () => void,
 *   onCancelEdit: () => void,
 *   onToggleActive: () => void,
 *   onMoveUp: () => void,
 *   onMoveDown: () => void,
 *   onDeleteRequest: () => void,
 * }} props
 */
export default function SocialLinkRow({
  link,
  isFirst,
  isLast,
  isEditing,
  draftUrl,
  error = null,
  isBusy = false,
  onStartEdit,
  onChangeDraftUrl,
  onConfirmEdit,
  onCancelEdit,
  onToggleActive,
  onMoveUp,
  onMoveDown,
  onDeleteRequest,
}) {
  const platform = getSocialPlatform(link.platform);
  if (!platform) return null;
  const { Icon, label } = platform;

  return (
    <div className="sd-card" style={{ padding: 'var(--space-3)' }}>
      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 'var(--space-3)' }}>
        <Icon size={20} aria-hidden="true" style={{ flexShrink: 0, color: 'var(--teal-600)' }} />
        <span style={{ fontWeight: 'var(--fw-semibold)', flexShrink: 0, minWidth: '90px' }}>
          {label}
        </span>

        {isEditing ? (
          <>
            <input
              type="url"
              className="sd-input"
              placeholder="https://..."
              value={draftUrl}
              onChange={(event) => onChangeDraftUrl(event.target.value)}
              autoFocus
              style={{ flex: 1, minWidth: '180px' }}
            />
            <div style={{ display: 'flex', gap: 'var(--space-1)', flexShrink: 0 }}>
              <button
                type="button"
                className="sd-btn sd-btn--ghost sd-btn--sm"
                onClick={onConfirmEdit}
                disabled={isBusy}
                aria-label={`Salvar URL de ${label}`}
              >
                <Check size={16} aria-hidden="true" />
              </button>
              <button
                type="button"
                className="sd-btn sd-btn--ghost sd-btn--sm"
                onClick={onCancelEdit}
                disabled={isBusy}
                aria-label="Cancelar edição"
              >
                <X size={16} aria-hidden="true" />
              </button>
            </div>
          </>
        ) : (
          <>
            <div style={{ flex: 1, minWidth: '180px', overflow: 'hidden' }}>
              <span
                className="sd-small sd-muted"
                style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', display: 'block' }}
              >
                {link.url || 'Sem URL definida'}
              </span>
            </div>
            <button
              type="button"
              className="sd-btn sd-btn--ghost sd-btn--sm"
              onClick={onStartEdit}
              disabled={isBusy}
              aria-label={`Editar URL de ${label}`}
            >
              <Pencil size={15} aria-hidden="true" />
            </button>
          </>
        )}

        <label className="sda-switch" style={{ flexShrink: 0 }}>
          <input
            type="checkbox"
            checked={link.active}
            onChange={onToggleActive}
            disabled={isBusy || isEditing}
          />
          <span className="sda-switch__track" aria-hidden="true" />
          <span className="sda-switch__label">{link.active ? 'Ativo' : 'Inativo'}</span>
        </label>

        <div style={{ display: 'flex', gap: 'var(--space-1)', flexShrink: 0 }}>
          <button
            type="button"
            className="sd-btn sd-btn--ghost sd-btn--sm"
            onClick={onMoveUp}
            disabled={isFirst || isBusy}
            aria-label={`Mover ${label} para cima`}
          >
            <ChevronUp size={14} aria-hidden="true" />
          </button>
          <button
            type="button"
            className="sd-btn sd-btn--ghost sd-btn--sm"
            onClick={onMoveDown}
            disabled={isLast || isBusy}
            aria-label={`Mover ${label} para baixo`}
          >
            <ChevronDown size={14} aria-hidden="true" />
          </button>
        </div>

        <button
          type="button"
          className="sd-btn sd-btn--ghost sd-btn--sm"
          onClick={onDeleteRequest}
          disabled={isBusy}
          aria-label={`Remover ${label}`}
        >
          <Trash2 size={16} aria-hidden="true" style={{ color: 'var(--danger)' }} />
        </button>
      </div>
      {error && <span className="sd-error">{error}</span>}
    </div>
  );
}

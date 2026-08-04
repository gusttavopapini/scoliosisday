// src/components/ui/ConfirmModal.jsx
// Confirmação de ação destrutiva.
// O nome do item é sempre exibido em destaque — nenhuma exclusão
// acontece sem o usuário ler o que está prestes a apagar.

import Modal from './Modal.jsx';
import t from '../../i18n/pt-BR.js';

/**
 * @param {{
 *   title: string,
 *   itemName?: string,
 *   body?: React.ReactNode,
 *   warning?: string,
 *   confirmLabel?: string,
 *   cancelLabel?: string,
 *   isDanger?: boolean,
 *   isBusy?: boolean,
 *   onCancel: () => void,
 *   onConfirm: () => void,
 * }} props
 */
export default function ConfirmModal({
  title,
  itemName,
  body,
  warning,
  confirmLabel = t.common.confirm,
  cancelLabel = t.common.cancel,
  isDanger = true,
  isBusy = false,
  onCancel,
  onConfirm,
}) {
  return (
    <Modal labelledBy="confirm-modal-title" onClose={onCancel} isBusy={isBusy}>
      <div className="sda-modal__head">
        <h2 id="confirm-modal-title">{title}</h2>
        <button
          className="sd-btn sd-btn--ghost sd-btn--sm"
          type="button"
          onClick={onCancel}
          disabled={isBusy}
          aria-label={t.common.close}
        >
          ✕
        </button>
      </div>

      <div className="sda-modal__body">
        {itemName && (
          <p style={{ fontWeight: 'var(--fw-semibold)', color: 'var(--text-heading)' }}>
            {itemName}
          </p>
        )}

        {body && (
          <div style={itemName ? { marginTop: 'var(--space-3)' } : undefined}>{body}</div>
        )}

        {warning && (
          <p className="sd-small" style={{ marginTop: 'var(--space-3)', color: 'var(--danger)' }}>
            ⚠ {warning}
          </p>
        )}
      </div>

      <div className="sda-modal__foot">
        <button
          className="sd-btn sd-btn--outline"
          type="button"
          onClick={onCancel}
          disabled={isBusy}
        >
          {cancelLabel}
        </button>
        <button
          className={`sd-btn sd-btn--primary${isDanger ? ' sd-btn--danger' : ''}`}
          type="button"
          onClick={onConfirm}
          disabled={isBusy}
        >
          {isBusy ? t.common.loading : confirmLabel}
        </button>
      </div>
    </Modal>
  );
}

// src/components/ui/DiscardChangesModal.jsx
// Confirmação de descarte, com a mesma copy em todos os formulários do painel.
//
// Envolve o ConfirmModal só para fixar título, corpo e rótulos: sem isto, cada
// formulário repetiria os quatro textos e eles divergiriam com o tempo.

import ConfirmModal from './ConfirmModal.jsx';
import t from '../../i18n/pt-BR.js';

/** @param {{ onCancel: () => void, onConfirm: () => void }} props */
export default function DiscardChangesModal({ onCancel, onConfirm }) {
  return (
    <ConfirmModal
      title={t.common.discardTitle}
      body={<p className="sd-muted">{t.common.discardBody}</p>}
      confirmLabel={t.common.discardConfirm}
      cancelLabel={t.common.discardCancel}
      isDanger
      onCancel={onCancel}
      onConfirm={onConfirm}
    />
  );
}

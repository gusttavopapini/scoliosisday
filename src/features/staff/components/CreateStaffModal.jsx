// src/features/staff/components/CreateStaffModal.jsx
// Modal de criação manual de membro (seção 11.6).
// O membro nasce approved e com mustChangePassword: true — a senha
// informada aqui é provisória e será trocada no primeiro login.

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Plus } from 'lucide-react';
import t from '../../../i18n/pt-BR.js';
import Modal from '../../../components/ui/Modal.jsx';
import { createStaffSchema } from '../schemas/staffSchema.js';

/**
 * @param {{
 *   onClose: () => void,
 *   onSubmit: (data: { email: string, password: string }) => Promise<void>,
 *   isPending?: boolean,
 * }} props
 */
export default function CreateStaffModal({ onClose, onSubmit, isPending = false }) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(createStaffSchema),
    defaultValues: { email: '', password: '' },
  });

  const isBusy = isSubmitting || isPending;

  return (
    <Modal labelledBy="create-staff-title" onClose={onClose} isBusy={isBusy}>
      <form onSubmit={handleSubmit(onSubmit)}>
          <div className="sda-modal__head">
            <h2 id="create-staff-title">{t.staff.create}</h2>
            <button
              className="sd-btn sd-btn--ghost sd-btn--sm"
              type="button"
              onClick={onClose}
              disabled={isBusy}
              aria-label={t.common.close}
            >
              ✕
            </button>
          </div>

          <div className="sda-modal__body">
            <label className="sd-field">
              <span className="sd-label">{t.staff.email}</span>
              <input
                {...register('email')}
                className="sd-input"
                type="email"
                autoComplete="off"
                placeholder={t.auth.emailPlaceholder}
                disabled={isBusy}
              />
              {errors.email && <span className="sd-error">{errors.email.message}</span>}
            </label>

            <label className="sd-field" style={{ marginTop: 'var(--space-4)' }}>
              <span className="sd-label">{t.staff.initialPassword}</span>
              <input
                {...register('password')}
                className="sd-input"
                type="password"
                autoComplete="new-password"
                placeholder={t.auth.passwordPlaceholder}
                disabled={isBusy}
              />
              {errors.password && <span className="sd-error">{errors.password.message}</span>}
              <span className="sd-note">{t.staff.initialPasswordHint}</span>
            </label>
          </div>

          <div className="sda-modal__foot">
            <button
              className="sd-btn sd-btn--outline"
              type="button"
              onClick={onClose}
              disabled={isBusy}
            >
              {t.common.cancel}
            </button>
            <button className="sd-btn sd-btn--primary" type="submit" disabled={isBusy}>
            <Plus size={16} aria-hidden="true" />
            {isBusy ? 'Criando…' : t.staff.create}
          </button>
        </div>
      </form>
    </Modal>
  );
}

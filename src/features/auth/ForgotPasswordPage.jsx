// src/features/auth/ForgotPasswordPage.jsx
// Tela de recuperação de senha — seção 8.3.
// Resposta sempre genérica: nunca revela se o e-mail existe.

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link } from 'react-router-dom';
import { Mail } from 'lucide-react';
import t from '../../i18n/pt-BR.js';
import { forgotPasswordSchema } from '../../schemas/auth.js';
import { useAuth } from '../../hooks/useAuth.js';

export default function ForgotPasswordPage() {
  const { resetPassword } = useAuth();
  const [sent, setSent] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: '' },
  });

  async function onSubmit(data) {
    await resetPassword(data.email);
    setSent(true);
  }

  return (
    <div className="sda-auth">
      <div className="sda-auth__card">
        {/* Logo */}
        <div className="sda-auth__logo" aria-hidden="true">
          Scoliosis <span>Day</span>
        </div>

        {/* Header */}
        <div className="sda-auth__header">
          <h1 className="sda-auth__title">{t.auth.resetPasswordTitle}</h1>
          <p className="sda-auth__subtitle">{t.auth.resetPasswordBody}</p>
        </div>

        {sent ? (
          // ── Estado de confirmação ──
          <div className="sda-auth__success">
            <div className="sda-auth__success-icon" aria-hidden="true">
              <Mail size={32} />
            </div>
            <p className="sda-auth__success-body">{t.auth.resetEmailSent}</p>
          </div>
        ) : (
          // ── Formulário ──
          <form
            className="sda-auth__form"
            onSubmit={handleSubmit(onSubmit)}
            noValidate
          >
            <div className={`sd-field${errors.email ? ' sd-field--error' : ''}`}>
              <label className="sd-field__label" htmlFor="forgot-email">
                {t.auth.email}
              </label>
              <input
                id="forgot-email"
                className="sd-input"
                type="email"
                autoComplete="email"
                placeholder={t.auth.emailPlaceholder}
                {...register('email')}
              />
              {errors.email && (
                <span className="sd-field__error">{errors.email.message}</span>
              )}
            </div>

            <button
              type="submit"
              className="sd-btn sd-btn--primary sd-btn--block"
              disabled={isSubmitting}
            >
              {isSubmitting ? t.auth.sendingResetLink : t.auth.sendResetLink}
            </button>
          </form>
        )}

        {/* Footer */}
        <div className="sda-auth__footer">
          <Link to="/login">{t.auth.backToLogin}</Link>
        </div>
      </div>
    </div>
  );
}

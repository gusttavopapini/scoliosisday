// src/features/auth/SetPasswordPage.jsx
// Tela bloqueante de definição de senha definitiva — seção 8.4.
// Acessível apenas quando mustChangePassword === true.
// Após sucesso, limpa a flag e libera a navegação para /.

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate } from 'react-router-dom';
import t from '../../i18n/pt-BR.js';
import { setPasswordSchema, passwordStrength } from '../../schemas/auth.js';
import { useAuth } from '../../hooks/useAuth.js';

const STRENGTH_LEVELS = ['weak', 'medium', 'strong'];
const STRENGTH_LABELS = [t.auth.strengthWeak, t.auth.strengthMedium, t.auth.strengthStrong];

export default function SetPasswordPage() {
  const navigate = useNavigate();
  const { setPassword, logout } = useAuth();
  const [serverError, setServerError] = useState('');

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(setPasswordSchema),
    defaultValues: { newPassword: '', confirmNewPassword: '' },
  });

  const watchedPassword = watch('newPassword');
  const strength = passwordStrength(watchedPassword);

  async function onSubmit(data) {
    setServerError('');
    try {
      await setPassword(data.newPassword);
      navigate('/painel', { replace: true });
    } catch {
      setServerError(t.common.errorGeneric);
    }
  }

  async function handleLogout() {
    await logout();
    navigate('/login', { replace: true });
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
          <h1 className="sda-auth__title">{t.auth.setPasswordTitle}</h1>
          <p className="sda-auth__subtitle">{t.auth.setPasswordSubtitle}</p>
        </div>

        {/* Erro do servidor */}
        {serverError && (
          <div className="sda-auth__alert" role="alert">
            <span className="sda-auth__alert-text">{serverError}</span>
          </div>
        )}

        {/* Form */}
        <form
          className="sda-auth__form"
          onSubmit={handleSubmit(onSubmit)}
          noValidate
        >
          {/* Nova senha */}
          <div className={`sd-field${errors.newPassword ? ' sd-field--error' : ''}`}>
            <label className="sd-field__label" htmlFor="set-new-password">
              {t.auth.newPassword}
            </label>
            <input
              id="set-new-password"
              className="sd-input"
              type="password"
              autoComplete="new-password"
              placeholder={t.auth.newPasswordPlaceholder}
              {...register('newPassword')}
            />
            {errors.newPassword && (
              <span className="sd-field__error">{errors.newPassword.message}</span>
            )}

            {/* Indicador de força */}
            {watchedPassword && (
              <div
                className={`sda-strength sda-strength--${STRENGTH_LEVELS[strength]}`}
                aria-live="polite"
              >
                <div className="sda-strength__bars">
                  <div className="sda-strength__bar" />
                  <div className="sda-strength__bar" />
                  <div className="sda-strength__bar" />
                </div>
                <span className="sda-strength__label">
                  {t.auth.passwordStrength}: {STRENGTH_LABELS[strength]}
                </span>
              </div>
            )}
          </div>

          {/* Confirmar nova senha */}
          <div className={`sd-field${errors.confirmNewPassword ? ' sd-field--error' : ''}`}>
            <label className="sd-field__label" htmlFor="set-confirm-password">
              {t.auth.confirmNewPassword}
            </label>
            <input
              id="set-confirm-password"
              className="sd-input"
              type="password"
              autoComplete="new-password"
              placeholder={t.auth.confirmPasswordPlaceholder}
              {...register('confirmNewPassword')}
            />
            {errors.confirmNewPassword && (
              <span className="sd-field__error">{errors.confirmNewPassword.message}</span>
            )}
          </div>

          {/* Botão */}
          <button
            type="submit"
            className="sd-btn sd-btn--primary sd-btn--block"
            disabled={isSubmitting}
          >
            {isSubmitting ? t.auth.settingPassword : t.auth.setPassword}
          </button>
        </form>

        {/* Footer — única saída: sair da conta */}
        <div className="sda-auth__footer">
          <button
            type="button"
            className="sd-btn sd-btn--ghost sd-btn--sm"
            onClick={handleLogout}
            style={{ margin: '0 auto' }}
          >
            {t.nav.logout}
          </button>
        </div>
      </div>
    </div>
  );
}

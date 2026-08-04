// src/features/auth/LoginPage.jsx
// Tela de login — seção 8.1.
// Layout: card centralizado sobre fundo --grad-teal.
// Erros nunca revelam se o e-mail existe.

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useNavigate } from 'react-router-dom';
import { AlertCircle } from 'lucide-react';
import t from '../../i18n/pt-BR.js';
import { loginSchema } from '../../schemas/auth.js';
import { useAuth } from '../../hooks/useAuth.js';

export default function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [statusError, setStatusError] = useState(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });

  async function onSubmit(data) {
    setStatusError(null);
    try {
      const result = await login(data.email, data.password);

      // mustChangePassword → rota bloqueante
      if (result.userData?.mustChangePassword) {
        navigate('/definir-senha', { replace: true });
        return;
      }

      navigate('/painel', { replace: true });
    } catch (err) {
      const code = err.message || err.code || '';

      if (code === 'STATUS_PENDING') {
        setStatusError({
          title: t.auth.statusPendingTitle,
          body: t.auth.statusPendingBody,
        });
      } else if (code === 'STATUS_BLOCKED') {
        setStatusError({
          title: t.auth.statusRejectedTitle,
          body: t.auth.statusRejectedBody,
        });
      } else {
        // Nunca revelar se o e-mail existe
        setStatusError({
          title: '',
          body: t.auth.errorInvalidCredentials,
        });
      }
    }
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
          <h1 className="sda-auth__title">{t.auth.loginTitle}</h1>
          <p className="sda-auth__subtitle">{t.auth.loginSubtitle}</p>
        </div>

        {/* Alert de status (pending/blocked) */}
        {statusError && (
          <div className="sda-auth__alert" role="alert">
            <span className="sda-auth__alert-icon" aria-hidden="true">
              <AlertCircle size={20} />
            </span>
            <span className="sda-auth__alert-text">
              {statusError.title && <strong>{statusError.title}. </strong>}
              {statusError.body}
            </span>
          </div>
        )}

        {/* Form */}
        <form
          className="sda-auth__form"
          onSubmit={handleSubmit(onSubmit)}
          noValidate
        >
          {/* E-mail */}
          <div className={`sd-field${errors.email ? ' sd-field--error' : ''}`}>
            <label className="sd-field__label" htmlFor="login-email">
              {t.auth.email}
            </label>
            <input
              id="login-email"
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

          {/* Senha */}
          <div className={`sd-field${errors.password ? ' sd-field--error' : ''}`}>
            <label className="sd-field__label" htmlFor="login-password">
              {t.auth.password}
            </label>
            <input
              id="login-password"
              className="sd-input"
              type="password"
              autoComplete="current-password"
              placeholder={t.auth.passwordPlaceholder}
              {...register('password')}
            />
            {errors.password && (
              <span className="sd-field__error">{errors.password.message}</span>
            )}
          </div>

          {/* Botão de login */}
          <button
            type="submit"
            className="sd-btn sd-btn--primary sd-btn--block"
            disabled={isSubmitting}
          >
            {isSubmitting ? t.auth.signingIn : t.auth.signIn}
          </button>
        </form>

        {/* Footer */}
        <div className="sda-auth__footer">
          <Link to="/esqueci-a-senha">{t.auth.forgotPassword}</Link>
          <span>
            {t.auth.alreadyHaveAccount}{' '}
            <Link to="/cadastro">{t.auth.signUp}</Link>
          </span>
        </div>
      </div>
    </div>
  );
}

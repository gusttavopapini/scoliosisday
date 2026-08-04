// src/features/auth/SignupPage.jsx
// Tela de cadastro — seção 8.2.
// Após envio: cria Auth + doc pending, signOut, tela de êxito, redirect em cinco segundos.

import { useState, useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useNavigate } from 'react-router-dom';
import { CheckCircle } from 'lucide-react';
import t from '../../i18n/pt-BR.js';
import { signupSchema, passwordStrength } from '../../schemas/auth.js';
import { useAuth } from '../../hooks/useAuth.js';

const STRENGTH_LEVELS = ['weak', 'medium', 'strong'];
const STRENGTH_LABELS = [t.auth.strengthWeak, t.auth.strengthMedium, t.auth.strengthStrong];
const REDIRECT_SECONDS = 5;

export default function SignupPage() {
  const navigate = useNavigate();
  const { signup } = useAuth();
  const [success, setSuccess] = useState(false);
  const [countdown, setCountdown] = useState(REDIRECT_SECONDS);
  const [serverError, setServerError] = useState('');
  const timerRef = useRef(null);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(signupSchema),
    defaultValues: { email: '', confirmEmail: '', password: '', confirmPassword: '' },
  });

  const watchedPassword = watch('password');
  const strength = passwordStrength(watchedPassword);

  // ── Timer de redirect após sucesso ──
  useEffect(() => {
    if (!success) return;

    timerRef.current = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          navigate('/login', { replace: true });
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timerRef.current);
  }, [success, navigate]);

  async function onSubmit(data) {
    setServerError('');
    try {
      await signup(data.email, data.password);
      setSuccess(true);
    } catch (err) {
      const code = err.code || err.message || '';
      if (code.includes('email-already-in-use')) {
        setServerError(t.auth.errorEmailInUse);
      } else if (code.includes('too-many-requests')) {
        setServerError(t.auth.errorTooManyRequests);
      } else {
        setServerError(t.common.errorGeneric);
      }
    }
  }

  // ── Tela de êxito ──
  if (success) {
    return (
      <div className="sda-auth">
        <div className="sda-auth__card">
          <div className="sda-auth__logo" aria-hidden="true">
            Scoliosis <span>Day</span>
          </div>

          <div className="sda-auth__success">
            <div className="sda-auth__success-icon" aria-hidden="true">
              <CheckCircle size={32} />
            </div>
            <h1 className="sda-auth__success-title">{t.auth.signUpSuccess}</h1>
            <p className="sda-auth__success-body">{t.auth.signUpSuccessBody}</p>
            <span className="sda-auth__countdown">
              {t.auth.redirectingToLogin.replace('{seconds}', countdown)}
            </span>
          </div>

          <div className="sda-auth__footer">
            <Link to="/login">{t.auth.backToLogin}</Link>
          </div>
        </div>
      </div>
    );
  }

  // ── Formulário de cadastro ──
  return (
    <div className="sda-auth">
      <div className="sda-auth__card">
        {/* Logo */}
        <div className="sda-auth__logo" aria-hidden="true">
          Scoliosis <span>Day</span>
        </div>

        {/* Header */}
        <div className="sda-auth__header">
          <h1 className="sda-auth__title">{t.auth.signUpTitle}</h1>
          <p className="sda-auth__subtitle">{t.auth.signUpSubtitle}</p>
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
          {/* E-mail */}
          <div className={`sd-field${errors.email ? ' sd-field--error' : ''}`}>
            <label className="sd-field__label" htmlFor="signup-email">
              {t.auth.email}
            </label>
            <input
              id="signup-email"
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

          {/* Confirmar e-mail */}
          <div className={`sd-field${errors.confirmEmail ? ' sd-field--error' : ''}`}>
            <label className="sd-field__label" htmlFor="signup-confirm-email">
              {t.auth.confirmEmail}
            </label>
            <input
              id="signup-confirm-email"
              className="sd-input"
              type="email"
              autoComplete="email"
              placeholder={t.auth.confirmEmailPlaceholder}
              {...register('confirmEmail')}
            />
            {errors.confirmEmail && (
              <span className="sd-field__error">{errors.confirmEmail.message}</span>
            )}
          </div>

          {/* Senha */}
          <div className={`sd-field${errors.password ? ' sd-field--error' : ''}`}>
            <label className="sd-field__label" htmlFor="signup-password">
              {t.auth.password}
            </label>
            <input
              id="signup-password"
              className="sd-input"
              type="password"
              autoComplete="new-password"
              placeholder={t.auth.newPasswordPlaceholder}
              {...register('password')}
            />
            {errors.password && (
              <span className="sd-field__error">{errors.password.message}</span>
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

          {/* Confirmar senha */}
          <div className={`sd-field${errors.confirmPassword ? ' sd-field--error' : ''}`}>
            <label className="sd-field__label" htmlFor="signup-confirm-password">
              {t.auth.confirmPassword}
            </label>
            <input
              id="signup-confirm-password"
              className="sd-input"
              type="password"
              autoComplete="new-password"
              placeholder={t.auth.confirmPasswordPlaceholder}
              {...register('confirmPassword')}
            />
            {errors.confirmPassword && (
              <span className="sd-field__error">{errors.confirmPassword.message}</span>
            )}
          </div>

          {/* Botão */}
          <button
            type="submit"
            className="sd-btn sd-btn--primary sd-btn--block"
            disabled={isSubmitting}
          >
            {isSubmitting ? t.auth.signingUp : t.auth.signUp}
          </button>
        </form>

        {/* Footer */}
        <div className="sda-auth__footer">
          <span>
            {t.auth.alreadyHaveAccount}{' '}
            <Link to="/login">{t.auth.signIn}</Link>
          </span>
        </div>
      </div>
    </div>
  );
}

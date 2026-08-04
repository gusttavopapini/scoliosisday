// src/schemas/auth.js
// Schemas Zod para validação de formulários de autenticação.
// Regras de senha: mínimo 8 caracteres, ao menos 1 letra e 1 número (seção 8.2).

import { z } from 'zod';
import t from '../i18n/pt-BR.js';

// ── Campos reutilizáveis ──

const emailField = z
  .string()
  .trim()
  .toLowerCase()
  .min(1, t.auth.errorInvalidCredentials)
  .email(t.auth.errorInvalidCredentials);

const passwordField = z
  .string()
  .min(8, t.auth.errorWeakPassword)
  .regex(/^(?=.*[a-zA-Z])(?=.*\d)/, t.auth.errorWeakPassword);

// ── Login ──

export const loginSchema = z.object({
  email: emailField,
  password: z.string().min(1, t.auth.errorInvalidCredentials),
});

// ── Cadastro ──

export const signupSchema = z
  .object({
    email: emailField,
    confirmEmail: z.string().trim().toLowerCase(),
    password: passwordField,
    confirmPassword: z.string(),
  })
  .refine((data) => data.email === data.confirmEmail, {
    message: t.auth.errorEmailMismatch,
    path: ['confirmEmail'],
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: t.auth.errorPasswordMismatch,
    path: ['confirmPassword'],
  });

// ── Recuperação de senha ──

export const forgotPasswordSchema = z.object({
  email: emailField,
});

// ── Definição de senha definitiva ──

export const setPasswordSchema = z
  .object({
    newPassword: passwordField,
    confirmNewPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmNewPassword, {
    message: t.auth.errorPasswordMismatch,
    path: ['confirmNewPassword'],
  });

// ── Helpers ──

/**
 * Calcula a força da senha: 0 = fraca, 1 = média, 2 = forte.
 * @param {string} password
 * @returns {0 | 1 | 2}
 */
export function passwordStrength(password) {
  if (!password || password.length < 8) return 0;

  let score = 0;
  if (password.length >= 12) score++;
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score++;
  if (/\d/.test(password)) score++;
  if (/[^a-zA-Z0-9]/.test(password)) score++;

  if (score <= 1) return 0;
  if (score <= 2) return 1;
  return 2;
}

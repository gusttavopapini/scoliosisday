// src/features/staff/schemas/staffSchema.js
// Validação do modal de criação manual de membro (seção 11.6).
// Mesmas regras de senha do auto-cadastro (seção 8.2).

import { z } from 'zod';
import t from '../../../i18n/pt-BR.js';

export const createStaffSchema = z.object({
  email: z
    .string()
    .trim()
    .toLowerCase()
    .min(1, 'E-mail obrigatório')
    .email('E-mail inválido'),
  password: z
    .string()
    .min(8, t.auth.errorWeakPassword)
    .regex(/^(?=.*[a-zA-Z])(?=.*\d)/, t.auth.errorWeakPassword),
});

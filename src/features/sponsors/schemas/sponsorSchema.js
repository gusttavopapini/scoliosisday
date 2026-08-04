// src/features/sponsors/schemas/sponsorSchema.js
// Validação com Zod para patrocinadores.

import { z } from 'zod';

export const sponsorSchema = z.object({
  name: z
    .string()
    .min(2, 'Nome deve ter no mínimo 2 caracteres')
    .max(120, 'Nome deve ter no máximo 120 caracteres'),
  website: z
    .string()
    .url('URL inválida')
    .min(1, 'Link do site é obrigatório'),
  logoUrl: z.string().nullable().optional(),
});

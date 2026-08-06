// src/features/sponsors/schemas/sponsorSchema.js
// Validação com Zod para patrocinadores.

import { z } from 'zod';
import { SPONSOR_TYPES } from '../../../utils/constants.js';

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
  // Ausente em patrocinadores cadastrados antes deste campo existir — a
  // leitura (não este schema, que só valida o formulário) trata isso como
  // SPONSOR. Aqui, default garante que todo salvamento passa a gravar um
  // valor explícito, mesmo que o staff nunca toque no seletor.
  type: z.enum([SPONSOR_TYPES.SPONSOR, SPONSOR_TYPES.SUPPORTER]).optional().default(SPONSOR_TYPES.SPONSOR),
});

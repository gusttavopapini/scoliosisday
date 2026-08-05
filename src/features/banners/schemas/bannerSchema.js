// src/features/banners/schemas/bannerSchema.js
// Validação com Zod para banners do carrossel da Home.
//
// Mesmos nomes de campo do evento (headline/subtitle/cta/ctaLink/banner*Url):
// os dois tipos alimentam o mesmo template visual do hero, e o carrossel da
// Home combina os dois num só array sem precisar renomear nada.

import { z } from 'zod';

export const bannerSchema = z.object({
  headline: z.string().min(2, 'Mínimo 2 caracteres').max(120, 'Máximo 120 caracteres'),
  subtitle: z.string().max(200, 'Máximo 200 caracteres').optional().default(''),
  cta: z.string().max(40, 'Máximo 40 caracteres').optional().default(''),
  ctaLink: z.string().url('URL inválida').optional().or(z.literal('')),
  bannerDesktopUrl: z.string().optional().default(''),
  bannerTabletUrl: z.string().optional().default(''),
  bannerMobileUrl: z.string().optional().default(''),
  // Posição no carrossel — mesmo espaço numérico do bannerOrder do evento.
  order: z
    .number({ invalid_type_error: 'Informe um número' })
    .int('Use um número inteiro')
    .min(1, 'Mínimo 1'),
  active: z.boolean().default(false),
});

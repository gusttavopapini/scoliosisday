// src/features/events/schemas/eventSchema.js
// Schema Zod para validação de eventos

import { z } from 'zod';

export const eventSchema = z.object({
  headline: z.string().min(5, 'Mínimo 5 caracteres').max(120, 'Máximo 120 caracteres'),
  subtitle: z.string().max(200, 'Máximo 200 caracteres'),
  // Banner por breakpoint. O campo legado `banner` continua no schema, sem
  // input próprio: eventos criados antes da separação mantêm o valor ao salvar
  // e o site público o usa como fallback quando o específico está vazio.
  banner: z.string().optional(),
  bannerDesktopUrl: z.string().optional(),
  bannerTabletUrl: z.string().optional(),
  bannerMobileUrl: z.string().optional(),
  // Posição do banner deste evento no carrossel da Home, quando isCurrent.
  // nullable/optional porque eventos anteriores ao carrossel não têm posição
  // — o merge do carrossel trata a ausência como "primeiro" (ver HomeHero).
  bannerOrder: z
    .number({ invalid_type_error: 'Informe um número' })
    .int('Use um número inteiro')
    .min(1, 'Mínimo 1')
    .nullable()
    .optional(),
  cta: z.string().min(1, 'CTA obrigatório').max(40, 'Máximo 40 caracteres'),
  ctaLink: z.string().url('URL válida obrigatória'),
  modality: z.literal('hybrid').default('hybrid'),
  priceInPerson: z.number().min(0, 'Preço não pode ser negativo'),
  priceOnline: z.number().min(0, 'Preço não pode ser negativo'),
  presentation: z.array(
    z.object({
      icon: z.string().min(1, 'Ícone obrigatório'),
      title: z.string().min(1, 'Título obrigatório').max(60, 'Máximo 60 caracteres'),
      description: z.string().max(200, 'Máximo 200 caracteres'),
    })
  ).length(3, 'Exatamente 3 cards obrigatórios'),
  speakers: z.array(z.string()).optional().default([]),
  starSpeakerIds: z.array(z.string()).optional().default([]),
  organizerIds: z.array(z.string()).optional().default([]),
  curatorIds: z.array(z.string()).optional().default([]),
  programming: z.string().optional().nullable(),
  sponsors: z.array(z.string()).optional().default([]),
  testimonials: z.array(
    z.object({
      text: z.string(),
      name: z.string(),
      surname: z.string(),
      occupation: z.string(),
    })
  ).optional().default([]),
  videos: z.array(z.string()).optional().default([]),
  gallery: z.array(z.string()).optional().default([]),
  colors: z.object({
    background: z.string().regex(/^#[0-9A-F]{6}$/i, 'Hex válido obrigatório'),
    text: z.string().regex(/^#[0-9A-F]{6}$/i, 'Hex válido obrigatório'),
    button: z.string().regex(/^#[0-9A-F]{6}$/i, 'Hex válido obrigatório'),
    detail: z.string().regex(/^#[0-9A-F]{6}$/i, 'Hex válido obrigatório'),
    highlight: z.string().regex(/^#[0-9A-F]{6}$/i, 'Hex válido obrigatório'),
  }).optional(),
  status: z.enum(['draft', 'published', 'archived']).default('draft').optional(),
  slug: z.string().optional(),
  // Ordem da edição, definida pelo admin — não derivada de createdAt.
  // nullable porque eventos anteriores a este campo não têm número, e o site
  // público os lista no fim, sem numeração.
  editionNumber: z
    .number({ invalid_type_error: 'Informe um número' })
    .int('Use um número inteiro')
    .min(1, 'Mínimo 1')
    .nullable()
    .optional(),
  // Quem grava o campo é setCurrentEvent, não os serviços de escrita comuns:
  // a invariante "só um atual" vive entre documentos. Aqui ele existe para o
  // toggle do passo 1 poder registrar a intenção do usuário.
  isCurrent: z.boolean().optional().default(false),
});

export const eventStepSchema = {
  step1: eventSchema.pick({
    headline: true,
    subtitle: true,
    editionNumber: true,
    bannerDesktopUrl: true,
    bannerTabletUrl: true,
    bannerMobileUrl: true,
    bannerOrder: true,
    cta: true,
    ctaLink: true,
    isCurrent: true,
  }),
  step2: eventSchema.pick({
    priceInPerson: true,
    priceOnline: true,
  }),
  step3: eventSchema.pick({
    presentation: true,
  }),
  step4: eventSchema.pick({
    speakers: true,
    starSpeakerIds: true,
    organizerIds: true,
    curatorIds: true,
    programming: true,
    sponsors: true,
  }),
  step5: eventSchema.pick({
    testimonials: true,
    videos: true,
    gallery: true,
    colors: true,
  }),
};

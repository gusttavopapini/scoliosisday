// src/features/events/schemas/eventSchema.js
// Schema Zod para validação de eventos

import { z } from 'zod';

const presentationItemSchema = z.object({
  icon: z.string().min(1, 'Ícone obrigatório'),
  title: z.string().min(1, 'Título obrigatório').max(60, 'Máximo 60 caracteres'),
  description: z.string().max(200, 'Máximo 200 caracteres'),
});

// Campos que existem e validam do mesmo jeito nos dois modos do wizard
// (edição atual ou passada). O que muda entre os dois é só a obrigatoriedade
// de cta/ctaLink/priceInPerson/priceOnline/presentation — ver eventSchema.
const sharedEventFields = {
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
  // Cor customizada do botão CTA do banner — só editável/exibida quando
  // isCurrent (ver EventStep1.jsx: hideCta), mas fica em sharedEventFields
  // (não numa das branches do discriminatedUnion) porque uma edição que já
  // teve isCurrent:true preserva o valor ao virar passada, mesmo sem poder
  // editá-lo por aqui. null = sem cor customizada, usa o laranja padrão do
  // design system (ver EditionHero.jsx/HomeHero.jsx).
  ctaButtonBg: z.string().regex(/^#[0-9A-F]{6}$/i, 'Hex válido obrigatório').nullable().optional(),
  ctaButtonText: z.string().regex(/^#[0-9A-F]{6}$/i, 'Hex válido obrigatório').nullable().optional(),
  // Cor customizada do separador (.sd-rule) — ao contrário do botão, editável
  // e exibida nos dois modos do wizard: uma edição passada não tem CTA, mas
  // ainda tem separador no banner (ver EditionHero.jsx). null = laranja
  // padrão do design system.
  separatorColor: z.string().regex(/^#[0-9A-F]{6}$/i, 'Hex válido obrigatório').nullable().optional(),
  // Local do evento (Passo 2, EventStep2.jsx) — só editável/exibido quando
  // isCurrent (edições passadas não têm este campo no wizard por ora), mas
  // fica em sharedEventFields pelo mesmo motivo de ctaButtonBg: preserva o
  // valor se uma edição atual com local definido depois virar passada.
  // null = sem local definido; o objeto inteiro nunca é gravado pela metade
  // (endereço sempre exige lat/lng, ver LocationPickerModal.jsx).
  location: z
    .object({
      lat: z.number(),
      lng: z.number(),
      address: z.string().min(1, 'Endereço obrigatório'),
    })
    .nullable()
    .optional(),
  modality: z.literal('hybrid').default('hybrid'),
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
  // Galeria da "página de arquivo" (corpo exibido em /edicoes quando o
  // evento NÃO é o atual — ver EditionArchive.jsx). `featured` marca até 3
  // fotos pro leque em destaque; o resto só aparece no lightbox da galeria
  // completa. Preenchível independente de isCurrent — staff pode montar o
  // arquivo antes mesmo da edição terminar.
  gallery: z.array(
    z.object({
      url: z.string(),
      featured: z.boolean().optional().default(false),
    })
  ).max(20, 'Máximo 20 fotos').optional().default([]),
  // Título/subtítulo da página de arquivo — distintos de headline/subtitle
  // (esses são do hero, sempre visíveis; archiveTitle só aparece no corpo
  // condicional de edição passada).
  archiveTitle: z.string().max(120, 'Máximo 120 caracteres').optional(),
  // Sem .max(): limite de caracteres removido a pedido — texto livre.
  archiveSubtitle: z.string().optional(),
  // 3 blocos fixos (mesmo padrão de `presentation`), cada campo opcional —
  // uma edição pode preencher só alguns blocos, e o site público oculta os
  // vazios individualmente (ver hasArchiveStat em utils/eventArchive.js).
  // prefix/suffix saíram do formulário (EventStep5.jsx) e da renderização
  // pública (ArchiveStatCard.jsx) — só `value` é editado/exibido agora.
  // Campos continuam aqui por compatibilidade com edições que já tinham
  // prefix/suffix preenchidos; nunca apagar dado histórico do Firestore.
  archiveStats: z.array(
    z.object({
      prefix: z.string().max(10, 'Máximo 10 caracteres').optional(),
      value: z.string().max(20, 'Máximo 20 caracteres').optional(),
      suffix: z.string().max(10, 'Máximo 10 caracteres').optional(),
      title: z.string().max(60, 'Máximo 60 caracteres').optional(),
      description: z.string().max(200, 'Máximo 200 caracteres').optional(),
    })
  ).length(3, 'Devem existir exatamente 3 blocos').optional(),
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
};

// isCurrent decide a FORMA do wizard (ver EventForm.jsx): edição atual exige
// CTA/link de inscrição, valores de ingresso e os 3 cards de apresentação;
// edição passada não exibe esses campos no formulário reduzido, então eles
// não podem ser obrigatórios nesse modo — mas continuam aceitos (e
// preservados) se já vieram preenchidos de quando o evento era o atual.
export const eventSchema = z.discriminatedUnion('isCurrent', [
  z.object({
    ...sharedEventFields,
    isCurrent: z.literal(true),
    cta: z.string().min(1, 'CTA obrigatório').max(40, 'Máximo 40 caracteres'),
    ctaLink: z.string().url('URL válida obrigatória'),
    priceInPerson: z.number().min(0, 'Preço não pode ser negativo'),
    priceOnline: z.number().min(0, 'Preço não pode ser negativo'),
    presentation: z.array(presentationItemSchema).length(3, 'Exatamente 3 cards obrigatórios'),
  }),
  z.object({
    ...sharedEventFields,
    isCurrent: z.literal(false),
    cta: z.string().max(40, 'Máximo 40 caracteres').optional().default(''),
    ctaLink: z.string().optional().default(''),
    priceInPerson: z.number().min(0, 'Preço não pode ser negativo').nullable().optional(),
    priceOnline: z.number().min(0, 'Preço não pode ser negativo').nullable().optional(),
    presentation: z.array(presentationItemSchema).optional().default([]),
  }),
]);

// Campos de cada passo do wizard, usados por EventForm.jsx para validação
// por passo (trigger) e para rotear erros de submit ao passo certo. Listas
// fixas, não derivadas de `.pick()`, porque eventSchema é um
// discriminatedUnion (sem método .pick()) desde que passou a variar por
// isCurrent.
export const STEP_FIELDS = {
  step1: [
    'headline', 'subtitle', 'editionNumber',
    'bannerDesktopUrl', 'bannerTabletUrl', 'bannerMobileUrl', 'bannerOrder',
    'cta', 'ctaLink', 'ctaButtonBg', 'ctaButtonText', 'separatorColor', 'isCurrent',
  ],
  // Passo 1 do wizard reduzido (edição passada): mesmos campos, sem CTA/link
  // — esse botão não é mais exibido publicamente para edições passadas. O
  // separador continua (ver EditionHero.jsx: aparece nos dois modos).
  step1Reduced: [
    'headline', 'subtitle', 'editionNumber',
    'bannerDesktopUrl', 'bannerTabletUrl', 'bannerMobileUrl', 'bannerOrder',
    'separatorColor', 'isCurrent',
  ],
  step2: ['priceInPerson', 'priceOnline', 'location'],
  step3: ['presentation'],
  step4: ['speakers', 'starSpeakerIds', 'organizerIds', 'curatorIds', 'programming', 'sponsors'],
  // Único passo que ainda existe do antigo "Passo 5": o wizard completo
  // (isCurrent: true) não tem mais passo de conteúdo de arquivo — só o
  // reduzido (isCurrent: false), como passo 2. Depoimentos/paleta de cores
  // saíram do formulário (ver EventStep5.jsx): não tinham nenhuma leitura
  // pública, então os campos `testimonials`/`colors` do schema seguem
  // preservados só por compatibilidade com dado histórico já salvo.
  step5Archive: ['gallery', 'archiveTitle', 'archiveSubtitle', 'archiveStats'],
};

// src/features/testimonials/schemas/testimonialSchema.js
// Validação com Zod para depoimentos — os campos obrigatórios mudam
// conforme o type, daí a união discriminada em vez de um único z.object.

import { z } from 'zod';

const sharedFields = {
  name: z
    .string()
    .min(1, 'Nome é obrigatório')
    .max(120, 'Nome deve ter no máximo 120 caracteres'),
  role: z
    .string()
    .min(1, 'Cargo é obrigatório')
    .max(120, 'Cargo deve ter no máximo 120 caracteres'),
  date: z
    .string()
    .min(1, 'Data é obrigatória'),
};

const textTestimonialSchema = z.object({
  type: z.literal('text'),
  quote: z
    .string()
    .min(10, 'Depoimento deve ter no mínimo 10 caracteres')
    .max(1000, 'Depoimento deve ter no máximo 1000 caracteres'),
  ...sharedFields,
});

const videoTestimonialSchema = z.object({
  type: z.literal('video'),
  videoUrl: z
    .string()
    .min(1, 'URL do vídeo é obrigatória')
    .url('URL inválida'),
  ...sharedFields,
});

export const testimonialSchema = z.discriminatedUnion('type', [
  textTestimonialSchema,
  videoTestimonialSchema,
]);

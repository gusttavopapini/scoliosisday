// src/features/programmings/schemas/programmingSchema.js
// Validação com Zod para programações.

import { z } from 'zod';

const sessionSchema = z.object({
  id: z.string(),
  title: z.string().min(1, 'Título da sessão é obrigatório'),
  theme: z.string().min(1, 'Tema é obrigatório'),
  startTime: z.string().min(1, 'Horário de início é obrigatório'),
  endTime: z.string().optional().nullable(),
  speakers: z.array(z.string()).min(1, 'Mínimo 1 palestrante obrigatório'),
});

const daySchema = z.object({
  id: z.string(),
  // '' e não null: o date picker é um input controlado; a data em si é
  // opcional (a programação pode existir antes de o dia ser confirmado).
  date: z.string().optional(),
  label: z.string().min(1, 'Rótulo do dia é obrigatório'),
  sessions: z.array(sessionSchema).min(1, 'Mínimo 1 sessão por dia'),
});

export const programmingSchema = z.object({
  name: z
    .string()
    .min(1, 'Nome da programação é obrigatório')
    .max(200, 'Nome deve ter no máximo 200 caracteres'),
  eventId: z.string().optional().nullable(),
  // Mínimo 1 dia, sem teto. A contagem vem do próprio array, sem um
  // daysCount separado que pudesse dessincronizar do array de fato.
  // Esta é a única validação de quantidade — o input não limita nada, para
  // não atrapalhar a digitação de números de dois dígitos.
  days: z.array(daySchema).min(1, 'Mínimo 1 dia obrigatório'),
});

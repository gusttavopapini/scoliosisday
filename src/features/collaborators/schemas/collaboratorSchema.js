// src/features/collaborators/schemas/collaboratorSchema.js
// Schema Zod para validação de formulário de colaboradores.

import { z } from 'zod';
import { COLLABORATOR_TYPES } from '../../../utils/constants.js';

export const collaboratorSchema = z.object({
  firstName: z
    .string()
    .min(1, 'Nome é obrigatório')
    .max(50, 'Nome não pode ter mais de 50 caracteres'),
  lastName: z
    .string()
    .min(1, 'Sobrenome é obrigatório')
    .max(50, 'Sobrenome não pode ter mais de 50 caracteres'),
  photoUrl: z.string().optional().nullable(),
  // Código ISO 3166-1 alpha-2 (ex: "BR") — exibido como emoji ao lado do
  // nome no card público (ver utils/countryFlags.js). Vazio = sem bandeira.
  flag: z.string().optional(),
  // Campo removido do formulário (sem input registrado) — optional() pra
  // não travar a validação com "Required" numa chave que não existe mais
  // nos dados enviados. Dado histórico de colaboradores antigos continua
  // intacto, só não é mais exibido/editável (mesma convenção de sponsors/
  // organizerIds em EventForm.jsx).
  minibio: z
    .string()
    .max(300, 'Mini bio não pode ter mais de 300 caracteres')
    .optional(),
  curriculum: z
    .string()
    .min(10, 'Currículo deve ter pelo menos 10 caracteres'),
  type: z.enum([
    COLLABORATOR_TYPES.SPEAKER,
    COLLABORATOR_TYPES.SCIENTIFIC_CURATOR,
    COLLABORATOR_TYPES.ORGANIZER,
  ], {
    errorMap: () => ({ message: 'Tipo de colaborador é obrigatório' }),
  }),
});

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
  minibio: z
    .string()
    .max(300, 'Mini bio não pode ter mais de 300 caracteres'),
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

// src/features/collaborators/mock.js
// Dados mock para Fase 1c. Substituídos por chamadas ao Firestore na Fase 2.
// Estrutura espelha exatamente o schema do documento /events/{id}/collaborators/{id}.

import { COLLABORATOR_TYPES } from '../../utils/constants.js';

/**
 * @typedef {Object} Collaborator
 * @property {string}  id
 * @property {string}  fullName
 * @property {string}  type         — COLLABORATOR_TYPES enum
 * @property {string}  institution  — Instituição / hospital
 * @property {string}  city
 * @property {string}  email
 * @property {string|null} photoUrl — null = usa iniciais
 * @property {Date}    createdAt
 */

/** @type {Collaborator[]} */
export const MOCK_COLLABORATORS = [
  {
    id: 'collab-ana-lima',
    fullName: 'Dra. Ana Paula Lima',
    type: COLLABORATOR_TYPES.SPEAKER,
    institution: 'HC-USP',
    city: 'São Paulo, SP',
    email: 'ana.lima@hcusp.br',
    photoUrl: null,
    createdAt: new Date('2026-01-15T10:30:00'),
  },
  {
    id: 'collab-carlos-mendes',
    fullName: 'Prof. Carlos Roberto Mendes',
    type: COLLABORATOR_TYPES.SCIENTIFIC_CURATOR,
    institution: 'UNIFESP',
    city: 'São Paulo, SP',
    email: 'c.mendes@unifesp.br',
    photoUrl: null,
    createdAt: new Date('2026-02-03T14:00:00'),
  },
  {
    id: 'collab-beatriz-santos',
    fullName: 'Beatriz Santos',
    type: COLLABORATOR_TYPES.ORGANIZER,
    institution: 'Scoliosis Day',
    city: 'Curitiba, PR',
    email: 'beatriz@scoliosisday.com.br',
    photoUrl: null,
    createdAt: new Date('2026-02-20T09:15:00'),
  },
  {
    id: 'collab-fernando-costa',
    fullName: 'Dr. Fernando Costa',
    type: COLLABORATOR_TYPES.SPEAKER,
    institution: 'Santa Casa BH',
    city: 'Belo Horizonte, MG',
    email: 'fernando.costa@santacasabh.org',
    photoUrl: null,
    createdAt: new Date('2026-03-01T11:00:00'),
  },
  {
    id: 'collab-mariana-silva',
    fullName: 'Dra. Mariana Silva',
    type: COLLABORATOR_TYPES.SPEAKER,
    institution: 'INCA',
    city: 'Rio de Janeiro, RJ',
    email: 'mariana.silva@inca.gov.br',
    photoUrl: null,
    createdAt: new Date('2026-03-12T16:45:00'),
  },
  {
    id: 'collab-pedro-rocha',
    fullName: 'Pedro Rocha',
    type: COLLABORATOR_TYPES.ORGANIZER,
    institution: 'Scoliosis Day',
    city: 'São Paulo, SP',
    email: 'pedro.rocha@scoliosisday.com.br',
    photoUrl: null,
    createdAt: new Date('2026-03-18T08:30:00'),
  },
  {
    id: 'collab-lucia-ferreira',
    fullName: 'Profa. Lúcia Ferreira',
    type: COLLABORATOR_TYPES.SCIENTIFIC_CURATOR,
    institution: 'FMUSP',
    city: 'São Paulo, SP',
    email: 'l.ferreira@fmusp.usp.br',
    photoUrl: null,
    createdAt: new Date('2026-04-05T13:20:00'),
  },
  {
    id: 'collab-rafael-nunes',
    fullName: 'Dr. Rafael Nunes',
    type: COLLABORATOR_TYPES.SPEAKER,
    institution: 'Hospital Sírio-Libanês',
    city: 'São Paulo, SP',
    email: 'rafael.nunes@hsl.org.br',
    photoUrl: null,
    createdAt: new Date('2026-04-22T10:00:00'),
  },
];

/** Filtro local por busca e tipo — simula query Firestore na Fase 1c. */
export function filterCollaborators(list, { search = '', type = '' }) {
  return list.filter((c) => {
    const matchesSearch =
      search === '' ||
      (c.fullName?.toLowerCase?.()?.includes?.(search.toLowerCase?.()) ?? false) ||
      (c.institution?.toLowerCase?.()?.includes?.(search.toLowerCase?.()) ?? false);
    const matchesType = type === '' || c.type === type;
    return matchesSearch && matchesType;
  });
}

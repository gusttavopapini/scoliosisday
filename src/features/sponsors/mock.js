// src/features/sponsors/mock.js
// Dados mock para patrocinadores.

/**
 * @typedef {Object} Sponsor
 * @property {string}  id
 * @property {string}  name
 * @property {string}  website
 * @property {string|null} logoUrl
 * @property {Date}    createdAt
 */

/** @type {Sponsor[]} */
export const MOCK_SPONSORS = [
  {
    id: 'sponsor-hcusp',
    name: 'HC-USP',
    website: 'https://www.hcusp.br',
    logoUrl: null,
    createdAt: new Date('2026-01-10T09:00:00'),
  },
  {
    id: 'sponsor-unifesp',
    name: 'UNIFESP',
    website: 'https://www.unifesp.br',
    logoUrl: null,
    createdAt: new Date('2026-01-15T14:30:00'),
  },
  {
    id: 'sponsor-incor',
    name: 'InCor',
    website: 'https://www.incor.usp.br',
    logoUrl: null,
    createdAt: new Date('2026-02-01T10:15:00'),
  },
  {
    id: 'sponsor-santa-casa',
    name: 'Santa Casa BH',
    website: 'https://www.santacasabh.org.br',
    logoUrl: null,
    createdAt: new Date('2026-02-10T11:45:00'),
  },
];

export function filterSponsors(list, { search = '' }) {
  return list.filter((s) => {
    const matchesSearch =
      search === '' ||
      (s.name?.toLowerCase?.()?.includes?.(search.toLowerCase?.()) ?? false) ||
      (s.website?.toLowerCase?.()?.includes?.(search.toLowerCase?.()) ?? false);
    return matchesSearch;
  });
}

// src/features/programmings/mock.js
// Dados mock para programações.

/**
 * @typedef {Object} Session
 * @property {string}  id
 * @property {string}  title
 * @property {string}  theme
 * @property {string}  startTime
 * @property {string}  endTime
 * @property {string[]} speakers - IDs de colaboradores
 */

/**
 * @typedef {Object} Programming
 * @property {string}  id
 * @property {string}  name
 * @property {string|null} eventId
 * @property {Session[]} sessions
 * @property {Date}    createdAt
 */

export const MOCK_PROGRAMMINGS = [
  {
    id: 'prog-sd-2026',
    name: 'Programação Scoliosis Day 2026',
    eventId: null,
    sessions: [
      {
        id: 'sess-1',
        title: 'Abertura e boas-vindas',
        theme: 'Inauguração do evento',
        startTime: '09:00',
        endTime: '09:30',
        speakers: [],
      },
      {
        id: 'sess-2',
        title: 'Inovações no tratamento cirúrgico',
        theme: 'Novas técnicas e procedimentos',
        startTime: '09:30',
        endTime: '10:30',
        speakers: ['collab-ana-lima'],
      },
    ],
    createdAt: new Date('2026-01-20T10:00:00'),
  },
];

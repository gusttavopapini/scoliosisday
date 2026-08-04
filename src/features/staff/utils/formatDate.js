// src/features/staff/utils/formatDate.js
// Formatação pt-BR das datas exibidas nas tabelas da equipe.

import { toDate } from '../../../utils/formatTimestamp.js';

/**
 * @param {*} value Timestamp do Firestore, Date ou null
 * @returns {string} data formatada, ou '—' quando não houver valor
 */
export function formatDate(value) {
  const date = toDate(value);
  if (!date || Number.isNaN(date.getTime())) return '—';
  return date.toLocaleDateString('pt-BR');
}

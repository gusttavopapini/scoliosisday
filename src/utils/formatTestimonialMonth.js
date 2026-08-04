// src/utils/formatTestimonialMonth.js
// `date` do depoimento é "YYYY-MM-DD" (ver services/testimonials.js — o
// Firestore guarda Timestamp, mas a leitura já devolve string). Formata
// como "Mês Ano" (ex.: "Janeiro 2026"), no idioma ativo do site.
//
// Monta a partir dos componentes — new Date(year, month-1, day) é hora
// local — em vez de new Date(string), que interpretaria como meia-noite
// UTC e poderia cair no mês anterior em fusos negativos (Brasil).

const LOCALE_BY_LANG = { 'pt-BR': 'pt-BR', en: 'en-US' };

/**
 * @param {string|null|undefined} dateString
 * @param {string} lang 'pt-BR' | 'en'
 * @returns {string} vazio quando não há data (ex.: depoimentos de fallback)
 */
export function formatTestimonialMonth(dateString, lang) {
  if (!dateString) return '';
  const [year, month, day] = dateString.split('-').map(Number);
  if (!year || !month || !day) return '';

  const date = new Date(year, month - 1, day);
  const locale = LOCALE_BY_LANG[lang] ?? 'pt-BR';
  const formatted = date.toLocaleDateString(locale, { month: 'long', year: 'numeric' });
  // toLocaleDateString em pt-BR devolve "janeiro de 2026" — capitaliza e
  // tira o "de" pra bater com o formato pedido ("Janeiro 2026").
  return formatted.replace(' de ', ' ').replace(/^\p{L}/u, (c) => c.toUpperCase());
}

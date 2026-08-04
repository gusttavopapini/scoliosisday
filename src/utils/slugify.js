// src/utils/slugify.js
// Gera slugs URL-safe a partir de texto livre em pt-BR.
// Remove acentos via normalização NFD antes de descartar o que não for [a-z0-9-].

// Marcas diacríticas combinantes (acentos) separadas pelo normalize('NFD').
const COMBINING_MARKS = /[̀-ͯ]/g;

/**
 * @param {string} text
 * @returns {string} slug em minúsculas, sem acentos, separado por hífens
 */
export function slugify(text) {
  return String(text ?? '')
    .normalize('NFD')
    .replace(COMBINING_MARKS, '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/**
 * Slug de evento derivado do headline. Nunca retorna vazio nem 'undefined':
 * sem headline utilizável, cai para um sufixo temporal estável.
 * @param {string} headline
 * @returns {string}
 */
export function eventSlug(headline) {
  return slugify(headline) || `evento-${Date.now()}`;
}

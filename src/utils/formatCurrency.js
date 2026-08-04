// src/utils/formatCurrency.js
// Formatação de preços do site público.
//
// priceInPerson/priceOnline são gravados em centavos (o mesmo esquema do
// campo mascarado do Passo 2 do wizard — ver EventStep2.jsx), nunca em reais.

/**
 * Centavos → "R$ 500,00" (pt-BR) ou "R$500.00" (en-US). A moeda é sempre
 * BRL — o evento é brasileiro independente do idioma da interface.
 * @param {number} cents
 * @param {'pt-BR'|'en'} lang
 * @returns {string}
 */
export function formatPriceBRL(cents, lang = 'pt-BR') {
  const value = typeof cents === 'number' && !Number.isNaN(cents) ? cents : 0;
  const locale = lang === 'pt-BR' ? 'pt-BR' : 'en-US';
  return (value / 100).toLocaleString(locale, { style: 'currency', currency: 'BRL' });
}

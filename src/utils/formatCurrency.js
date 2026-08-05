// src/utils/formatCurrency.js
// Formatação de preços do site público.
//
// priceInPerson/priceOnline são gravados em centavos (o mesmo esquema do
// campo mascarado do Passo 2 do wizard — ver EventStep2.jsx), nunca em reais.

/**
 * Centavos → "R$ 500,00" (pt-BR) ou "BRL 500.00" (en-US). A moeda é sempre
 * BRL — o evento é brasileiro independente do idioma da interface; só o
 * FORMATO de exibição muda com o idioma, o valor numérico é o mesmo.
 *
 * currencyDisplay força a diferença entre os dois: o padrão do Intl é
 * 'symbol' nos dois locales, e o símbolo de BRL ("R$") não muda por
 * locale — sem isso, o en-US também mostraria "R$1,200.00" (separadores
 * certos, prefixo errado). 'code' no en-US troca o símbolo pelo código
 * ISO ("BRL"); pt-BR fica no padrão (símbolo), sem mudança de
 * comportamento.
 * @param {number} cents
 * @param {'pt-BR'|'en'} lang
 * @returns {string}
 */
export function formatPriceBRL(cents, lang = 'pt-BR') {
  const value = typeof cents === 'number' && !Number.isNaN(cents) ? cents : 0;
  const locale = lang === 'pt-BR' ? 'pt-BR' : 'en-US';
  const currencyDisplay = lang === 'pt-BR' ? 'symbol' : 'code';
  return (value / 100).toLocaleString(locale, { style: 'currency', currency: 'BRL', currencyDisplay });
}

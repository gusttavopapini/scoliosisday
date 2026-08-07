// src/utils/countryFlags.js
// Bandeira do colaborador no card de pessoa (PersonCard.jsx) — emoji nativo
// via Regional Indicator Symbols, sem precisar de upload/ícone próprio.
// Lista curta e focada nos países mais comuns num evento médico brasileiro
// de alcance internacional; não é exaustiva.

export const COUNTRIES = [
  { code: 'BR', name: 'Brasil' },
  { code: 'PT', name: 'Portugal' },
  { code: 'US', name: 'Estados Unidos' },
  { code: 'AR', name: 'Argentina' },
  { code: 'CL', name: 'Chile' },
  { code: 'UY', name: 'Uruguai' },
  { code: 'PY', name: 'Paraguai' },
  { code: 'CO', name: 'Colômbia' },
  { code: 'PE', name: 'Peru' },
  { code: 'MX', name: 'México' },
  { code: 'ES', name: 'Espanha' },
  { code: 'FR', name: 'França' },
  { code: 'IT', name: 'Itália' },
  { code: 'DE', name: 'Alemanha' },
  { code: 'GB', name: 'Reino Unido' },
  { code: 'CA', name: 'Canadá' },
  { code: 'JP', name: 'Japão' },
];

/**
 * Converte um código ISO 3166-1 alpha-2 (ex: "BR") no emoji de bandeira
 * correspondente. Cada letra vira um "regional indicator symbol" (par
 * substituto Unicode) — é assim que o emoji de bandeira funciona nativamente
 * em qualquer fonte de sistema, sem precisar de arquivo de imagem.
 * @param {string} code
 * @returns {string}
 */
export function countryFlagEmoji(code) {
  if (!code || code.length !== 2) return '';
  return String.fromCodePoint(
    ...[...code.toUpperCase()].map((letter) => 127397 + letter.charCodeAt(0)),
  );
}

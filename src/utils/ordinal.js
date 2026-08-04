// src/utils/ordinal.js
// Numeral ordinal por idioma — "1ª"/"1st", "2ª"/"2nd" etc.

/**
 * @param {number} n Posição, 1-based.
 * @param {'pt-BR'|'en'} lang
 * @returns {string}
 */
export function ordinal(n, lang = 'pt-BR') {
  if (lang === 'pt-BR') return `${n}ª`;

  // en: 1st, 2nd, 3rd, 4th... com a exceção de 11–13, que são sempre "th".
  const mod100 = n % 100;
  if (mod100 >= 11 && mod100 <= 13) return `${n}th`;

  switch (n % 10) {
    case 1: return `${n}st`;
    case 2: return `${n}nd`;
    case 3: return `${n}rd`;
    default: return `${n}th`;
  }
}

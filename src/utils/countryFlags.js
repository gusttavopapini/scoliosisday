// src/utils/countryFlags.js
// País do colaborador — lista completa (ISO 3166-1 alpha-2 + nome em
// português) via i18n-iso-countries, ~249 países/territórios. Usada pelo
// seletor de bandeira do formulário de Colaboradores — o painel é sempre
// PT-BR (sem toggle de idioma), por isso só o locale 'pt' é registrado.
//
// A bandeira em si, no card público, é renderizada com <CircleFlag> de
// react-circle-flags (ver PersonCard.jsx) — o código ISO alpha-2 já é
// compatível direto com o `countryCode` esperado por ela (minúsculo; ver
// conversão no próprio PersonCard), sem mapeamento extra entre as libs.

import countries from 'i18n-iso-countries';
import ptLocale from 'i18n-iso-countries/langs/pt.json';

countries.registerLocale(ptLocale);

/** Todos os países/territórios ISO 3166-1, nome em português, A→Z. */
export const COUNTRIES = Object.entries(countries.getNames('pt'))
  .map(([code, name]) => ({ code, name }))
  .sort((a, b) => a.name.localeCompare(b.name, 'pt'));

/**
 * Converte um código ISO 3166-1 alpha-2 (ex: "BR") no emoji de bandeira
 * correspondente — só pro <option> do <select> do formulário: HTML nativo
 * não aceita <img>/componente dentro de <option>, apenas texto puro, e
 * emoji funciona como texto. O card público usa <CircleFlag> de verdade,
 * não isto.
 * @param {string} code
 * @returns {string}
 */
export function countryFlagEmoji(code) {
  if (!code || code.length !== 2) return '';
  return String.fromCodePoint(
    ...[...code.toUpperCase()].map((letter) => 127397 + letter.charCodeAt(0)),
  );
}

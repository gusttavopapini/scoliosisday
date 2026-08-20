// src/utils/countryFlags.js
// País do colaborador — lista completa (ISO 3166-1 alpha-2 + nome em
// português) via i18n-iso-countries, ~249 países/territórios. Usada pelo
// seletor de bandeira do formulário de Colaboradores — o painel é sempre
// PT-BR (sem toggle de idioma), por isso só o locale 'pt' é registrado.
//
// A bandeira em si é renderizada com <CircleFlag> de react-circle-flags,
// tanto no card público (PersonCard.jsx) quanto em cada opção do
// combobox (CountryCombobox.jsx) — o código ISO alpha-2 já é compatível
// direto com o `countryCode` esperado por ela (minúsculo; ver a conversão
// nos dois pontos), sem mapeamento extra entre as libs.

import countries from 'i18n-iso-countries';
import ptLocale from 'i18n-iso-countries/langs/pt.json';

countries.registerLocale(ptLocale);

/**
 * Apelidos de busca — nomes pelos quais as pessoas PROCURAM um país, mas
 * que não são o nome oficial que a ISO devolve.
 *
 * É o que resolve o problema relatado: a Holanda sempre esteve na lista,
 * como "Países Baixos" (o nome oficial em pt), e o <select> nativo que
 * havia aqui só casava digitação pelo COMEÇO do rótulo — digitar
 * "Holanda" nunca chegava a um item que começa com "P", e o país parecia
 * não existir.
 *
 * Só afeta a BUSCA. O nome exibido continua sendo o oficial da ISO, em
 * lista e em seleção — nada aqui muda o que aparece na tela nem o que é
 * gravado (sempre o código alpha-2).
 */
const SEARCH_ALIASES = {
  NL: ['holanda'],
  US: ['eua', 'estados unidos da america', 'usa'],
  GB: ['inglaterra', 'gra bretanha', 'gran bretanha', 'uk'],
  CH: ['suica'],
  DE: ['alemanha ocidental'],
  AE: ['emirados arabes'],
  KR: ['coreia do sul', 'coreia'],
  KP: ['coreia do norte'],
  CZ: ['republica tcheca', 'tchequia'],
  CI: ['costa do marfim'],
  MM: ['birmania'],
  CV: ['cabo verde'],
  TL: ['timor leste'],
  VA: ['vaticano'],
  RU: ['russia'],
  IR: ['ira'],
  VE: ['venezuela'],
  BO: ['bolivia'],
  TZ: ['tanzania'],
  MK: ['macedonia'],
  SZ: ['suazilandia'],
};

/**
 * Minúsculas e sem acento, para comparar "Países Baixos" com "paises
 * baixos". NFD separa a letra do diacrítico; o range \u0300-\u036f é o
 * bloco de acentos combinantes, removido em seguida.
 * @param {string} value
 * @returns {string}
 */
export function normalizeForSearch(value) {
  return (value ?? '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
}

/**
 * Todos os países/territórios ISO 3166-1, nome em português, A→Z.
 *
 * `search` é pré-calculado uma vez (o módulo é avaliado uma só vez): são
 * ~250 países e o combobox filtra a cada tecla — normalizar tudo a cada
 * digitação seria trabalho repetido à toa.
 */
export const COUNTRIES = Object.entries(countries.getNames('pt'))
  .map(([code, name]) => ({
    code,
    name,
    search: [normalizeForSearch(name), code.toLowerCase(), ...(SEARCH_ALIASES[code] ?? [])],
  }))
  .sort((a, b) => a.name.localeCompare(b.name, 'pt'));

/**
 * Filtra COUNTRIES por nome (começo OU qualquer parte), código ISO e
 * apelidos. Sem termo, devolve a lista inteira.
 *
 * Ordena os que COMEÇAM com o termo antes dos que só o contêm: digitar
 * "ira" deve trazer "Irã"/"Iraque" antes de "Emirados Árabes Unidos".
 * Dentro de cada grupo, a ordem alfabética de COUNTRIES é preservada
 * (Array.prototype.sort é estável).
 *
 * @param {string} term
 * @returns {typeof COUNTRIES}
 */
export function filterCountries(term) {
  const needle = normalizeForSearch(term);
  if (!needle) return COUNTRIES;

  const matches = COUNTRIES.filter((country) =>
    country.search.some((candidate) => candidate.includes(needle)),
  );

  return matches.sort((a, b) => {
    const aStarts = a.search.some((candidate) => candidate.startsWith(needle));
    const bStarts = b.search.some((candidate) => candidate.startsWith(needle));
    return aStarts === bStarts ? 0 : aStarts ? -1 : 1;
  });
}

/** Nome oficial de um código alpha-2, ou '' se não houver. */
export function countryName(code) {
  if (!code) return '';
  return COUNTRIES.find((country) => country.code === code)?.name ?? '';
}

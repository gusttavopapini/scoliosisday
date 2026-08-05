// src/utils/preserveAcronyms.js
// Divide um título em pedaços de texto normal + siglas (2+ letras
// maiúsculas seguidas, ex: "ABTE") — usado nos títulos de card que
// levam text-transform:lowercase pra virar caixa de frase (ver
// .sdp-feature-card__title em public.css): sem isso, a sigla também
// seria baixada ("ABTE" → "abte"). Runtime, sobre texto já existente no
// dicionário ou vindo do admin — não reescreve nenhum conteúdo.

/** @param {string} text @returns {{ text: string, caps: boolean }[]} */
export function splitAcronyms(text) {
  if (!text) return [];
  return (text.match(/\S+|\s+/g) || []).map((part) => ({
    text: part,
    caps: /^[A-ZÀ-Ú]{2,}[.,;:!?]?$/.test(part),
  }));
}

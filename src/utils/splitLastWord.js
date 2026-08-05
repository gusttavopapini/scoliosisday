// src/utils/splitLastWord.js
// Separa a última palavra de uma frase já existente no dicionário, pra
// estilizar como acento (--font-accent) sem duplicar o texto em pares de
// chaves *Main/*Accent novos — mesmo padrão visual, aplicado em runtime
// sobre uma frase estática (nunca sobre conteúdo traduzido pela API).

/** @param {string} text @returns {{ main: string, accent: string }} */
export function splitLastWord(text) {
  const trimmed = (text || '').trim();
  const idx = trimmed.lastIndexOf(' ');
  if (idx === -1) return { main: '', accent: trimmed };
  return { main: trimmed.slice(0, idx), accent: trimmed.slice(idx + 1) };
}

/** Separa uma frase em torno da menção "Scoliosis Day" (mesmo texto nos
 * dois idiomas, nunca traduzido), pra trocar só esse trecho por
 * <BrandWordmark /> sem mexer no resto da frase. `after` vem sem trim —
 * quem chama decide se ainda vai processar essa parte (ex.: splitLastWord).
 * @param {string} text @returns {{ before: string, after: string } | null} */
export function splitOnBrand(text) {
  const idx = (text || '').indexOf('Scoliosis Day');
  if (idx === -1) return null;
  return { before: text.slice(0, idx), after: text.slice(idx + 'Scoliosis Day'.length) };
}

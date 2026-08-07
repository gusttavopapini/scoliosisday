// src/utils/eventArchive.js
// Regras de conteúdo da "página de arquivo" de uma edição passada (ver
// EditionArchive.jsx) — mesmo padrão de hasValidPresentation em
// presentationIcons.js: o dado pode faltar (edições antigas, criadas antes
// deste recurso existir) e cada pedaço se oculta de forma independente.

/**
 * A seção inteira só existe com pelo menos o título preenchido — sem ele,
 * não há o que ancorar subtítulo/galeria/estatísticas soltos na tela.
 * @param {object} event
 * @returns {boolean}
 */
export function hasArchiveContent(event) {
  return Boolean(event?.archiveTitle?.trim());
}

/**
 * Até 3 fotos marcadas `featured` — a ordem de cadastro é a ordem do leque.
 * Menos de 3 marcadas é válido: o leque se adapta ao que existir.
 * @param {{ url: string, featured?: boolean }[]} gallery
 * @returns {{ url: string, featured?: boolean }[]}
 */
export function getFeaturedGalleryImages(gallery) {
  if (!Array.isArray(gallery)) return [];
  return gallery.filter((item) => item?.featured && item?.url).slice(0, 3);
}

/**
 * Um bloco de estatística só conta como preenchido com um valor — prefixo,
 * sufixo, título e descrição sozinhos não fazem sentido como número.
 * @param {{ value?: string }} stat
 * @returns {boolean}
 */
export function hasArchiveStat(stat) {
  return Boolean(stat?.value?.trim());
}

/**
 * @param {object[]} stats
 * @returns {boolean}
 */
export function hasAnyArchiveStat(stats) {
  return Array.isArray(stats) && stats.some(hasArchiveStat);
}

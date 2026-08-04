// src/utils/eventBanner.js
// Resolução do banner de um evento com fallback para o campo legado.
//
// Até o passo 1 do wizard separar os banners por breakpoint, todo evento tinha
// um único campo `banner`. Os documentos antigos continuam com ele preenchido e
// sem os novos, então qualquer leitura de banner passa por aqui: pede o
// breakpoint desejado, cai nos irmãos e, por último, no legado.

const ORDER = ['bannerDesktopUrl', 'bannerTabletUrl', 'bannerMobileUrl'];

/**
 * URL do banner do evento para um breakpoint, com fallback.
 * @param {object} event Documento do evento.
 * @param {'desktop'|'tablet'|'mobile'} [breakpoint] Arte preferida.
 * @returns {string} URL, ou '' quando o evento não tem banner algum.
 */
export function eventBannerUrl(event, breakpoint = 'desktop') {
  if (!event) return '';

  const preferred = `banner${breakpoint[0].toUpperCase()}${breakpoint.slice(1)}Url`;
  const candidates = [preferred, ...ORDER, 'banner'];

  for (const field of candidates) {
    const url = event[field];
    if (typeof url === 'string' && url.trim()) return url.trim();
  }

  return '';
}

// src/utils/videoEmbed.js
// Resolve a URL de um depoimento em vídeo (YouTube, Vimeo ou upload MP4
// direto no Storage) para o que o player de /depoimentos precisa: um
// <iframe> de embed para os dois primeiros, um <video> para o terceiro.

const YOUTUBE_RE = /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([\w-]{11})/;
const VIMEO_RE = /vimeo\.com\/(?:video\/)?(\d+)/;

/**
 * @param {string} url
 * @returns {{ type: 'youtube'|'vimeo'|'mp4', embedUrl: string }|null}
 */
export function getVideoEmbedInfo(url) {
  if (!url) return null;

  const youtubeMatch = url.match(YOUTUBE_RE);
  if (youtubeMatch) {
    // enablejsapi=1 + origin: sem isso a YouTube IFrame API não consegue se
    // conectar a este iframe pra reportar play/pause (ver useEmbedPlaybackState.js).
    const origin = encodeURIComponent(window.location.origin);
    return {
      type: 'youtube',
      embedUrl: `https://www.youtube.com/embed/${youtubeMatch[1]}?enablejsapi=1&origin=${origin}`,
    };
  }

  const vimeoMatch = url.match(VIMEO_RE);
  if (vimeoMatch) {
    return { type: 'vimeo', embedUrl: `https://player.vimeo.com/video/${vimeoMatch[1]}` };
  }

  // Nem YouTube nem Vimeo: só sobra o upload direto (MP4 no Storage).
  return { type: 'mp4', embedUrl: url };
}

/**
 * A URL aponta para um vídeo de plataforma externa (YouTube ou Vimeo)?
 *
 * Distinto de getVideoEmbedInfo(), que NUNCA devolve null para uma string
 * não vazia: lá, o que não casa YouTube/Vimeo cai no fallback 'mp4', porque
 * depoimentos aceitam upload direto no Storage e o <video> reproduz
 * qualquer URL. A seção de vídeo da edição (videoBlock) não aceita upload —
 * ver EventStepVideo.jsx —, então precisa de uma checagem que REPROVE o
 * que não for plataforma, em vez de assumir arquivo.
 *
 * @param {string} url
 * @returns {boolean}
 */
export function isPlatformVideoUrl(url) {
  if (!url) return false;
  return YOUTUBE_RE.test(url) || VIMEO_RE.test(url);
}

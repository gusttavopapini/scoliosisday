// src/hooks/useEmbedPlaybackState.js
// Detecta play/pause/ended de um <iframe> de YouTube ou Vimeo já montado em
// `iframeRef`. Um <iframe> puro não expõe esse estado ao React — cada
// plataforma exige seu próprio SDK carregado via <script> (IFrame API do
// YouTube, Player.js do Vimeo), que se conecta ao iframe existente em vez
// de criar um novo (por isso o iframe precisa ter `enablejsapi=1` na URL
// pro caso do YouTube — ver videoEmbed.js). Cada API é carregada uma única
// vez por sessão (cache no módulo) e reaproveitada por todos os cards.

import { useEffect, useState } from 'react';

const YT_API_URL = 'https://www.youtube.com/iframe_api';
const VIMEO_API_URL = 'https://player.vimeo.com/api/player.js';

let ytApiPromise = null;
function loadYouTubeApi() {
  if (window.YT?.Player) return Promise.resolve(window.YT);
  if (!ytApiPromise) {
    ytApiPromise = new Promise((resolve) => {
      const previousCallback = window.onYouTubeIframeAPIReady;
      window.onYouTubeIframeAPIReady = () => {
        previousCallback?.();
        resolve(window.YT);
      };
      const script = document.createElement('script');
      script.src = YT_API_URL;
      document.head.appendChild(script);
    });
  }
  return ytApiPromise;
}

let vimeoApiPromise = null;
function loadVimeoApi() {
  if (window.Vimeo?.Player) return Promise.resolve(window.Vimeo);
  if (!vimeoApiPromise) {
    vimeoApiPromise = new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = VIMEO_API_URL;
      script.onload = () => resolve(window.Vimeo);
      script.onerror = reject;
      document.head.appendChild(script);
    });
  }
  return vimeoApiPromise;
}

/**
 * @param {{ type: 'youtube'|'vimeo'|'mp4'|undefined, iframeRef: { current: HTMLIFrameElement|null } }} params
 * @returns {boolean} true enquanto o embed está em reprodução ativa.
 */
export function useEmbedPlaybackState({ type, iframeRef }) {
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    if (type !== 'youtube' && type !== 'vimeo') return undefined;

    let cancelled = false;

    if (type === 'youtube') {
      loadYouTubeApi().then((YT) => {
        if (cancelled || !iframeRef.current) return;
        // eslint-disable-next-line no-new -- só precisamos dos callbacks de evento, não guardamos a instância.
        new YT.Player(iframeRef.current, {
          events: {
            onStateChange: (event) => {
              if (cancelled) return;
              if (event.data === YT.PlayerState.PLAYING) setIsPlaying(true);
              else if (event.data === YT.PlayerState.PAUSED || event.data === YT.PlayerState.ENDED) setIsPlaying(false);
            },
          },
        });
      });
    } else {
      loadVimeoApi().then((Vimeo) => {
        if (cancelled || !iframeRef.current) return;
        const player = new Vimeo.Player(iframeRef.current);
        player.on('play', () => !cancelled && setIsPlaying(true));
        player.on('pause', () => !cancelled && setIsPlaying(false));
        player.on('ended', () => !cancelled && setIsPlaying(false));
      });
    }

    return () => {
      cancelled = true;
    };
    // iframeRef é um useRef (identidade estável): só o mount do card e o
    // tipo de embed devem reiniciar essa ligação.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [type]);

  return isPlaying;
}

// src/features/public/components/testimonials/VideoTestimonials.jsx
// Seção da Home, logo abaixo dos depoimentos em texto: pilha de
// depoimentos em vídeo (coleção testimonials, type: 'video'). Sem nenhum
// cadastrado, a seção inteira some — ao contrário da textual, não há
// fallback para vídeo.

import { useState, useEffect, useRef } from 'react';
import { useLanguage } from '../../../../hooks/useLanguage.js';
import { useStoredTranslation } from '../../../../hooks/useStoredTranslation.js';
import { displayName } from '../../../../utils/honorifics.js';
import { useTestimonials } from '../../../../hooks/useTestimonials.js';
import { useEmbedPlaybackState } from '../../../../hooks/useEmbedPlaybackState.js';
import { getVideoEmbedInfo } from '../../../../utils/videoEmbed.js';
import TestimonialStack from './TestimonialStack.jsx';

/**
 * Card real (ativo ou vizinho em depth-1, ver VideoTestimonials abaixo).
 * Precisa ser um componente à parte pra poder chamar hooks — o card
 * fantasma (distance > 1) não deve pagar o custo de nenhum SDK de player.
 *
 * `onPlayingChange` reporta se ESTE card está tocando E ativo — só o
 * ativo deve conseguir pausar o autoplay do carrossel; o vizinho pré-
 * carregado fica fora de vista e não é interativo.
 */
function VideoTestimonialCard({ item, isActive, onPlayingChange }) {
  // Mesmo tratamento do card textual: `role` tem `_en` gravado ao salvar,
  // o nome é normalizado localmente. `quote` não existe neste tipo.
  const { lang } = useLanguage();
  const translated = useStoredTranslation(item, ['role']);
  const embed = getVideoEmbedInfo(item.videoUrl);
  const iframeRef = useRef(null);

  // Só YouTube/Vimeo passam por aqui — mp4 usa os eventos nativos do
  // <video> abaixo, que já reportam play/pause/ended de graça.
  const embedIsPlaying = useEmbedPlaybackState({ type: embed?.type, iframeRef });

  useEffect(() => {
    if (embed?.type === 'youtube' || embed?.type === 'vimeo') {
      onPlayingChange(isActive && embedIsPlaying);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- embed?.type não muda pro mesmo item.
  }, [isActive, embedIsPlaying, onPlayingChange]);

  // Card saiu da janela "ativo + depth-1" (virou fantasma) enquanto ainda
  // achava que estava tocando: não pode deixar o autoplay travado.
  useEffect(() => () => onPlayingChange(false), [onPlayingChange]);

  return (
    <div className="sdp-video-testimonial-card">
      {/* --portrait: os depoimentos são gravados em vertical (story). O
          .sdp-video-embed base continua 16:9 e é compartilhado com o
          vídeo das páginas de Edição (EditionVideo.jsx) e com a prévia do
          wizard (EventStepVideo.jsx) — por isso a proporção vertical
          entra como modificador aqui, e não na classe base. */}
      <div className="sdp-video-embed sdp-video-embed--portrait">
        {embed?.type === 'mp4' ? (
          // eslint-disable-next-line jsx-a11y/media-has-caption -- vídeo enviado pelo admin, sem legendas geradas.
          <video
            src={embed.embedUrl}
            controls
            onPlay={() => onPlayingChange(isActive)}
            onPause={() => onPlayingChange(false)}
            onEnded={() => onPlayingChange(false)}
          />
        ) : (
          <iframe
            ref={iframeRef}
            src={embed?.embedUrl}
            title={item.name}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        )}
      </div>

      <div className="sdp-video-testimonial__caption">
        <span className="sdp-video-testimonial__name">{displayName(item.name, lang)}</span>
        <span className="sdp-video-testimonial__role">{translated.role}</span>
      </div>
    </div>
  );
}

/** @param {{ title: string }} props */
export default function VideoTestimonials({ title }) {
  const { data: items = [] } = useTestimonials('video');
  const [index, setIndex] = useState(0);
  // Autoplay do carrossel pausa enquanto o vídeo ativo está tocando — sem
  // isso, a pilha embaralharia por baixo de quem está assistindo, mesmo
  // com o mouse fora do card. Cobre os 3 tipos de embed (mp4 nativo,
  // YouTube e Vimeo via SDK — ver VideoTestimonialCard acima).
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    setIndex(0);
  }, [items.length]);

  // Trocar de slide não pode deixar o estado "tocando" do vídeo anterior
  // grudado no próximo, que ainda nem carregou.
  useEffect(() => {
    setIsPlaying(false);
  }, [index]);

  if (items.length === 0) return null;

  const count = items.length;

  function step(delta) {
    setIndex((prev) => (prev + delta + count) % count);
  }

  return (
    <section className="sd-section sd-section--tight">
      <div className="sd-container">
        {/* Sem header próprio: o título da seção de texto (HomeTestimonials,
            logo acima) funciona como título guarda-chuva pras duas pilhas
            juntas — texto e vídeo. `title` some da tela mas continua
            existindo só pro aria-label da navegação abaixo. */}
        <TestimonialStack
          items={items}
          index={index}
          onPrev={() => step(-1)}
          onNext={() => step(1)}
          ariaLabel={title}
          centered
          orientation="horizontal"
          pause={isPlaying}
          renderCard={(item, { isActive, distance }) => {
            // Cards a partir de depth-2 são só uma casca decorativa (ver
            // .sdp-video-stack-ghost) — mas o vizinho mais próximo
            // (distance <= 1, isto é, também o depth-1) já monta o player
            // de verdade, mesmo sem estar ativo ainda. Ele chega a essa
            // posição pouco antes de virar ativo (um passo de cada vez —
            // ver TestimonialStack.jsx), o que dá tempo do <iframe>
            // carregar a thumbnail enquanto ainda está fora de vista, em
            // vez de nascer do zero bem no meio da troca de slide e
            // mostrar um flash escuro até carregar.
            if (distance > 1) {
              return <div className="sdp-video-stack-ghost" aria-hidden="true" />;
            }

            return (
              <VideoTestimonialCard item={item} isActive={isActive} onPlayingChange={setIsPlaying} />
            );
          }}
        />
      </div>
    </section>
  );
}

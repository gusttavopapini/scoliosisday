// src/features/public/components/testimonials/VideoTestimonials.jsx
// Seção da Home, logo abaixo dos depoimentos em texto: pilha de
// depoimentos em vídeo (coleção testimonials, type: 'video'). Sem nenhum
// cadastrado, a seção inteira some — ao contrário da textual, não há
// fallback para vídeo.

import { useState, useEffect } from 'react';
import { useTestimonials } from '../../../../hooks/useTestimonials.js';
import { getVideoEmbedInfo } from '../../../../utils/videoEmbed.js';
import TestimonialStack from './TestimonialStack.jsx';

/** @param {{ title: string }} props */
export default function VideoTestimonials({ title }) {
  const { data: items = [] } = useTestimonials('video');
  const [index, setIndex] = useState(0);
  // Autoplay do carrossel pausa enquanto o vídeo ativo está tocando —
  // sem isso, a pilha embaralharia por baixo de quem está assistindo.
  // Só dá pra saber isso de verdade pro <video> nativo (onPlay/onPause
  // são eventos do próprio elemento); iframe do YouTube/Vimeo não expõe
  // o estado de reprodução sem embutir o SDK JS de cada plataforma —
  // fora do escopo desta rodada, então esses continuam sem essa pausa
  // extra (o autoplay simples do carrossel ainda se aplica a eles).
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

            const embed = getVideoEmbedInfo(item.videoUrl);

            return (
              <div className="sdp-video-testimonial-card">
                <div className="sdp-video-embed">
                  {embed?.type === 'mp4' ? (
                    // eslint-disable-next-line jsx-a11y/media-has-caption -- vídeo enviado pelo admin, sem legendas geradas.
                    <video
                      src={embed.embedUrl}
                      controls
                      onPlay={() => isActive && setIsPlaying(true)}
                      onPause={() => isActive && setIsPlaying(false)}
                      onEnded={() => isActive && setIsPlaying(false)}
                    />
                  ) : (
                    <iframe
                      src={embed?.embedUrl}
                      title={item.name}
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  )}
                </div>

                <div className="sdp-video-testimonial__caption">
                  <span className="sdp-video-testimonial__name">{item.name}</span>
                  <span className="sdp-video-testimonial__role">{item.role}</span>
                </div>
              </div>
            );
          }}
        />
      </div>
    </section>
  );
}

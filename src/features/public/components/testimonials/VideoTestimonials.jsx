// src/features/public/components/testimonials/VideoTestimonials.jsx
// Seção 2 de /depoimentos: pilha de depoimentos em vídeo (coleção
// testimonials, type: 'video'). Sem nenhum cadastrado, a seção inteira
// some — ao contrário da textual, não há fallback para vídeo.

import { useState, useEffect } from 'react';
import { useLanguage } from '../../../../hooks/useLanguage.js';
import { useTestimonials } from '../../../../hooks/useTestimonials.js';
import { getVideoEmbedInfo } from '../../../../utils/videoEmbed.js';
import { splitLastWord } from '../../../../utils/splitLastWord.js';
import AccentWord from '../../../../components/public/AccentWord.jsx';
import TestimonialStack from './TestimonialStack.jsx';

/** @param {{ title: string }} props */
export default function VideoTestimonials({ title }) {
  const { t } = useLanguage();
  const { data: items = [] } = useTestimonials('video');
  const [index, setIndex] = useState(0);

  useEffect(() => {
    setIndex(0);
  }, [items.length]);

  if (items.length === 0) return null;

  const count = items.length;

  function step(delta) {
    setIndex((prev) => (prev + delta + count) % count);
  }

  const headline = splitLastWord(title);

  return (
    <section className="sd-section sd-section--tight">
      <div className="sd-container">
        <header className="sd-section-header sd-section-header--center sdp-section-header">
          <span className="sdp-section-tag">{t.site.testimonialsTitle}</span>
          <h2 className="sd-display sd-display--md sd-display--upright sd-display--teal sdp-testimonials-headline">
            {headline.main} <AccentWord>{headline.accent}</AccentWord>
          </h2>
          <div className="sd-rule" aria-hidden="true">
            <i /><i /><i /><i /><i />
          </div>
        </header>

        <TestimonialStack
          items={items}
          index={index}
          onPrev={() => step(-1)}
          onNext={() => step(1)}
          ariaLabel={title}
          centered
          renderCard={(item, isActive) => {
            // Só o card ativo carrega o player de verdade — os de trás,
            // que ficam por baixo na pilha, são só uma casca decorativa
            // (ver .sdp-video-stack-ghost), pra não tocar vários embeds
            // ao mesmo tempo só por causa do efeito visual de pilha.
            if (!isActive) {
              return <div className="sdp-video-stack-ghost" aria-hidden="true" />;
            }

            const embed = getVideoEmbedInfo(item.videoUrl);

            return (
              <div>
                <div className="sdp-video-embed">
                  {embed?.type === 'mp4' ? (
                    // eslint-disable-next-line jsx-a11y/media-has-caption -- vídeo enviado pelo admin, sem legendas geradas.
                    <video src={embed.embedUrl} controls />
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

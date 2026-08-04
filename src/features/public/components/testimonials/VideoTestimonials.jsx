// src/features/public/components/testimonials/VideoTestimonials.jsx
// Seção 2 de /depoimentos: carrossel de depoimentos em vídeo (coleção
// testimonials, type: 'video'). Sem nenhum cadastrado, a seção inteira
// some — ao contrário da textual, não há fallback para vídeo.

import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useLanguage } from '../../../../hooks/useLanguage.js';
import { useTestimonials } from '../../../../hooks/useTestimonials.js';
import { getVideoEmbedInfo } from '../../../../utils/videoEmbed.js';

/** @param {{ title: string }} props */
export default function VideoTestimonials({ title }) {
  const { t } = useLanguage();
  const { data: items = [] } = useTestimonials('video');
  const [index, setIndex] = useState(0);

  useEffect(() => {
    setIndex(0);
  }, [items.length]);

  if (items.length === 0) return null;

  const current = items[index] ?? items[0];
  const embed = getVideoEmbedInfo(current.videoUrl);
  const count = items.length;

  function step(delta) {
    setIndex((prev) => (prev + delta + count) % count);
  }

  return (
    <section className="sd-section sd-section--tight">
      <div className="sd-container">
        <header className="sd-section-header sd-section-header--center sdp-section-header">
          <h2 className="sd-display sd-display--md sd-display--upright sd-display--teal">{title}</h2>
          <div className="sd-rule" aria-hidden="true">
            <i /><i /><i /><i /><i />
          </div>
        </header>

        <div className="sdp-carousel">
          <div key={index} className="sdp-carousel__slide">
            <div className="sdp-video-embed">
              {embed?.type === 'mp4' ? (
                // eslint-disable-next-line jsx-a11y/media-has-caption -- vídeo enviado pelo admin, sem legendas geradas.
                <video src={embed.embedUrl} controls />
              ) : (
                <iframe
                  src={embed?.embedUrl}
                  title={current.name}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              )}
            </div>

            <div className="sdp-video-testimonial__caption">
              <span className="sdp-video-testimonial__name">{current.name}</span>
              <span className="sdp-video-testimonial__role">{current.role}</span>
            </div>
          </div>

          {count > 1 && (
            <div className="sdp-carousel__nav" style={{ justifyContent: 'center' }}>
              <button
                type="button"
                className="sdp-carousel__btn"
                onClick={() => step(-1)}
                aria-label={t.site.testimonialPrev}
              >
                <ChevronLeft size={20} aria-hidden="true" />
              </button>
              <button
                type="button"
                className="sdp-carousel__btn"
                onClick={() => step(1)}
                aria-label={t.site.testimonialNext}
              >
                <ChevronRight size={20} aria-hidden="true" />
              </button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

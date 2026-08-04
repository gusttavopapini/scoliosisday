// src/features/public/components/HomeTestimonials.jsx
// Seção 3 da Home: depoimentos da edição mais recente publicada.
//
// usePublishedEvents traz os publicados já ordenados (mais recente primeiro);
// daqui saem tanto o contador de edições quanto os depoimentos — uma consulta
// só. Quando a edição mais recente não tem depoimentos, entra o par de
// fallback do dicionário, então o carrossel nunca fica vazio.

import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useLanguage } from '../../../hooks/useLanguage.js';
import { usePublishedEvents } from '../../../hooks/useEvents.js';

/** Depoimento do evento ({text,name,surname,occupation}) → {text,author,role}. */
function normalize(item) {
  return {
    text: item.text,
    author: [item.name, item.surname].filter(Boolean).join(' '),
    role: item.occupation,
  };
}

export default function HomeTestimonials() {
  const { t } = useLanguage();
  const { data: publishedEvents = [] } = usePublishedEvents();
  const [index, setIndex] = useState(0);

  const latest = publishedEvents[0];
  const fromEvent = (latest?.testimonials ?? []).filter((item) => item.text?.trim());
  const items = fromEvent.length > 0
    ? fromEvent.map(normalize)
    : t.site.testimonialsFallback;

  // A lista muda quando os dados chegam ou o idioma troca o fallback; um
  // índice fora dela renderizaria um slide vazio.
  useEffect(() => {
    setIndex(0);
  }, [items.length, t]);

  const count = items.length;
  const current = items[index] ?? items[0];

  function step(delta) {
    setIndex((prev) => (prev + delta + count) % count);
  }

  return (
    <section className="sd-section sd-section--tight">
      <div className="sd-container sdp-testimonials">
        {/* Coluna esquerda: título, subtítulo e contador de edições */}
        <header className="sd-section-header">
          <h2 className="sd-display sd-display--lg sd-display--upright sd-display--teal">
            {t.site.testimonialsTitle}
          </h2>
          <div className="sd-rule" aria-hidden="true">
            <i /><i /><i /><i /><i />
          </div>
          <p className="sd-lead">{t.site.testimonialsSubtitle}</p>

          <div className="sd-stat sd-stat--orange">
            <span className="sd-stat__value">{publishedEvents.length}</span>
            <span className="sd-stat__label">{t.site.editionsHeld}</span>
          </div>
        </header>

        {/* Coluna direita: carrossel — key={index} reinicia o fade a cada troca */}
        <div className="sdp-carousel">
          <figure key={index} className="sd-quote sdp-carousel__slide">
            <blockquote>{current.text}</blockquote>
            <figcaption>
              <span className="sd-quote__avatar" aria-hidden="true" />
              <span>
                <b>{current.author}</b>
                <small>{current.role}</small>
              </span>
            </figcaption>
          </figure>

          {count > 1 && (
            <div className="sdp-carousel__nav">
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

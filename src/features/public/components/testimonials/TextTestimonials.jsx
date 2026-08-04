// src/features/public/components/testimonials/TextTestimonials.jsx
// Seção 1 de /depoimentos: carrossel de depoimentos textuais (coleção
// testimonials, type: 'text'). Sem nenhum cadastrado, cai nos 2 exemplos
// de t.site.testimonialsFallback — os mesmos já usados na Home — para a
// seção nunca aparecer vazia.

import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useLanguage } from '../../../../hooks/useLanguage.js';
import { useTestimonials } from '../../../../hooks/useTestimonials.js';
import { formatTestimonialMonth } from '../../../../utils/formatTestimonialMonth.js';
import AvatarInitials from '../../../../components/ui/AvatarInitials.jsx';

/** Depoimento do Firestore ({quote,name,role,date}) e do fallback
 * ({text,author,role}) reduzidos ao mesmo formato para o slide não
 * precisar saber a origem. */
function normalize(item, index) {
  if ('quote' in item) return item;
  return { id: `fallback-${index}`, quote: item.text, name: item.author, role: item.role, date: null };
}

/** @param {{ title: string }} props */
export default function TextTestimonials({ title }) {
  const { t, lang } = useLanguage();
  const { data: fetched = [] } = useTestimonials('text');
  const [index, setIndex] = useState(0);

  const source = fetched.length > 0 ? fetched : t.site.testimonialsFallback;
  const items = source.map(normalize);
  const count = items.length;

  // A fonte muda quando os dados chegam (fallback → Firestore) ou o
  // idioma troca o fallback; um índice fora dela renderizaria vazio.
  useEffect(() => {
    setIndex(0);
  }, [count]);

  const current = items[index] ?? items[0];
  const dateLabel = formatTestimonialMonth(current.date, lang);

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
          <figure key={index} className="sd-quote sdp-carousel__slide sdp-testimonial-quote">
            <blockquote>{current.quote}</blockquote>
            <figcaption>
              <AvatarInitials
                name={current.name}
                photoUrl={null}
                id={current.id}
                className="sdp-avatar sdp-avatar--sm"
              />
              <span>
                <b>{current.name}</b>
                <small>{[current.role, dateLabel].filter(Boolean).join(' · ')}</small>
              </span>
            </figcaption>
          </figure>

          {count > 1 && (
            <>
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

              <div className="sdp-carousel__dots" role="tablist" aria-label={title}>
                {items.map((item, i) => (
                  <button
                    key={item.id}
                    type="button"
                    role="tab"
                    aria-selected={i === index}
                    aria-label={`${i + 1}`}
                    className={`sdp-carousel__dot${i === index ? ' sdp-carousel__dot--active' : ''}`}
                    onClick={() => setIndex(i)}
                  />
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </section>
  );
}

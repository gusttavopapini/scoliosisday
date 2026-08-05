// src/features/public/components/testimonials/TextTestimonials.jsx
// Seção 1 de /depoimentos: pilha de depoimentos textuais, coleção
// `testimonials` (type: 'text') do Firestore — sem depoimento publicado,
// a seção inteira some (nunca mostra mock nem espaço vazio).

import { useState, useEffect } from 'react';
import { useLanguage } from '../../../../hooks/useLanguage.js';
import { useTestimonials } from '../../../../hooks/useTestimonials.js';
import { splitLastWord, splitOnBrand } from '../../../../utils/splitLastWord.js';
import AccentWord from '../../../../components/public/AccentWord.jsx';
import BrandWordmark from '../../../../components/BrandWordmark.jsx';
import TestimonialStack from './TestimonialStack.jsx';
import TestimonialQuoteCard from './TestimonialQuoteCard.jsx';

/** Headline sem quebra manual — mesmo fluxo natural usado na Home. */
function renderNaturalHeadline(fullSubtitle) {
  const brandSplit = splitOnBrand(fullSubtitle);
  const headline = splitLastWord(brandSplit ? brandSplit.after : fullSubtitle);
  return (
    <>
      {brandSplit && <>{brandSplit.before.trim()} <BrandWordmark /> </>}
      {headline.main} <AccentWord>{headline.accent}</AccentWord>
    </>
  );
}

/** Headline com quebra manual em 2 linhas — só quando breakAfter (pt-BR.js)
 * existe e é de fato um prefixo do texto atual; senão cai no fluxo natural. */
function renderHeadline(fullSubtitle, breakAfter) {
  if (!breakAfter || !fullSubtitle.startsWith(breakAfter)) {
    return renderNaturalHeadline(fullSubtitle);
  }

  const line1Brand = splitOnBrand(breakAfter);
  const line2 = splitLastWord(fullSubtitle.slice(breakAfter.length).trim());

  return (
    <>
      <span className="sdp-testimonials-headline__line">
        {line1Brand ? <>{line1Brand.before.trim()} <BrandWordmark /> {line1Brand.after.trim()}</> : breakAfter}
      </span>
      <span className="sdp-testimonials-headline__line">
        {line2.main} <AccentWord>{line2.accent}</AccentWord>
      </span>
    </>
  );
}

/** @param {{ title: string }} props */
export default function TextTestimonials({ title }) {
  const { t } = useLanguage();
  const { data: items = [] } = useTestimonials('text');
  const [index, setIndex] = useState(0);
  const count = items.length;

  // A lista muda quando os dados chegam; um índice fora dela renderizaria
  // um slide vazio.
  useEffect(() => {
    setIndex(0);
  }, [count]);

  if (count === 0) return null;

  function step(delta) {
    setIndex((prev) => (prev + delta + count) % count);
  }

  // testimonialsSubtitleBreakAfter só existe em pt-BR.js — em inglês a
  // chave vem undefined e renderHeadline cai no fluxo natural (mesmo
  // tratamento da Home, sem quebra forçada).
  const headlineContent = renderHeadline(t.site.testimonialsSubtitle, t.site.testimonialsSubtitleBreakAfter);

  return (
    <section className="sd-section sd-section--tight">
      <div className="sd-container">
        <header className="sd-section-header sd-section-header--center sdp-section-header">
          <span className="sdp-section-tag">{t.site.testimonialsTitle}</span>
          <h2 className="sd-display sd-display--md sd-display--upright sd-display--teal sdp-testimonials-headline">
            {headlineContent}
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
          renderCard={(item) => <TestimonialQuoteCard item={item} />}
        />

        {count > 1 && (
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
        )}
      </div>
    </section>
  );
}

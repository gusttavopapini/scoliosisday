// src/features/public/components/HomeTestimonials.jsx
// Seção 3 da Home: preview de depoimentos, mesma coleção `testimonials`
// (type: 'text') do Firestore que /depoimentos usa — sem nenhum
// publicado, a seção inteira some (nunca mostra mock nem espaço vazio).
//
// usePublishedEvents só alimenta o contador "X Edições realizadas" ao
// lado; os depoimentos em si não vêm mais do evento (bug corrigido: a
// Home lia de um array legado embutido no documento do evento, com
// fallback pra um mock estático — divergente da coleção real que o
// painel /painel/depoimentos de fato gerencia).

import { useState, useEffect } from 'react';
import { useLanguage } from '../../../hooks/useLanguage.js';
import { usePublishedEvents } from '../../../hooks/useEvents.js';
import { useTestimonials } from '../../../hooks/useTestimonials.js';
import { splitLastWord, splitOnBrand } from '../../../utils/splitLastWord.js';
import AccentWord from '../../../components/public/AccentWord.jsx';
import BrandWordmark from '../../../components/BrandWordmark.jsx';
import TestimonialStack from './testimonials/TestimonialStack.jsx';
import TestimonialQuoteCard, { TestimonialQuoteCardGhost } from './testimonials/TestimonialQuoteCard.jsx';

export default function HomeTestimonials() {
  const { t } = useLanguage();
  const { data: publishedEvents = [] } = usePublishedEvents();
  const { data: items = [] } = useTestimonials('text');
  const [index, setIndex] = useState(0);
  const count = items.length;

  // A lista muda quando os dados chegam; um índice fora dela renderizaria
  // um slide vazio.
  useEffect(() => {
    setIndex(0);
  }, [count]);

  if (count === 0) return null;

  // "Scoliosis Day" no meio da frase vira <BrandWordmark />; o resto
  // depois dela mantém o acento na última palavra já aprovado antes.
  const brandSplit = splitOnBrand(t.site.testimonialsSubtitle);
  const headline = splitLastWord(brandSplit ? brandSplit.after : t.site.testimonialsSubtitle);

  function step(delta) {
    setIndex((prev) => (prev + delta + count) % count);
  }

  return (
    <section className="sd-section sd-section--tight">
      <div className="sd-container sdp-testimonials">
        {/* Coluna esquerda: tag, headline e contador de edições */}
        <header className="sd-section-header">
          <span className="sdp-section-tag">{t.site.testimonialsTitle}</span>
          <h2 className="sd-display sd-display--lg sd-display--upright sd-display--teal sdp-testimonials-headline">
            {brandSplit && <>{brandSplit.before.trim()} <BrandWordmark /> </>}
            {headline.main} <AccentWord>{headline.accent}</AccentWord>
          </h2>
          <div className="sd-rule" aria-hidden="true">
            <i /><i /><i /><i /><i />
          </div>

          <div className="sd-stat sd-stat--orange">
            <span className="sd-stat__value">{publishedEvents.length}</span>
            <span className="sd-stat__label sdp-stat__label">
              <span className="sdp-stat__label-line1">{t.site.editionsHeldLine1}</span>
              <span className="sdp-stat__label-line2">{t.site.editionsHeldLine2}</span>
            </span>
          </div>
        </header>

        {/* Coluna direita: pilha de depoimentos */}
        <TestimonialStack
          items={items}
          index={index}
          onPrev={() => step(-1)}
          onNext={() => step(1)}
          ariaLabel={t.site.testimonialsTitle}
          renderCard={(item, { isActive }) => (
            isActive ? <TestimonialQuoteCard item={item} /> : <TestimonialQuoteCardGhost />
          )}
        />
      </div>
    </section>
  );
}

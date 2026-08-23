// src/features/public/components/editions/EditionPricing.jsx
// Seção 3 de /edicoes: os dois cards de modalidade (presencial/online).
//
// Em desktop os cards viram slides — um por vez, com fade, setas e
// auto-avanço a cada cinco segundos (pausado no hover e desligado com
// prefers-reduced-motion). Em mobile os dois ficam sempre visíveis,
// empilhados: a alternância acontece só a partir do breakpoint em CSS
// (ver .sdp-pricing em public.css), não há um "modo mobile" em JS.

import { useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useLanguage } from '../../../../hooks/useLanguage.js';
import { useStoredTranslation } from '../../../../hooks/useStoredTranslation.js';
import { formatPriceBRL } from '../../../../utils/formatCurrency.js';
import { PRICING_CARD_TRANSLATABLE_FIELDS } from '../../../../utils/pricingCards.js';

const AUTO_SLIDE_MS = 5000;

/** @param {{ event: object }} props */
export default function EditionPricing({ event }) {
  const { t, lang } = useLanguage();
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  // Personalização opcional de cada card, vinda do Passo 2 do wizard
  // (EventStep2.jsx). Duas chamadas fixas e no topo porque são hooks — não
  // dá pra iterar sobre os cards aqui. Card ausente (o caso de toda edição
  // publicada antes deste recurso) devolve undefined e cai inteiro nos
  // padrões abaixo.
  const inPersonCard = useStoredTranslation(event.inPersonCard, PRICING_CARD_TRANSLATABLE_FIELDS);
  const onlineCard = useStoredTranslation(event.onlineCard, PRICING_CARD_TRANSLATABLE_FIELDS);

  const hasInPerson = typeof event.priceInPerson === 'number';
  const hasOnline = typeof event.priceOnline === 'number';

  // Rótulo do botão quando o card não tem um próprio: o CTA da edição
  // (Passo 1, compartilhado com o banner) e, sem ele, o padrão do site.
  // A personalização por card entra na FRENTE dessa cadeia, sem substituí-la
  // — é granularidade nova, não troca de fonte.
  const defaultCtaLabel = event.cta?.trim() || t.site.cta;

  // Cada campo cai no seu próprio padrão de forma independente: trocar só a
  // cor da tag não afeta o subtítulo nem o botão. `||` e não `??` de
  // propósito — string vazia tem que cair no padrão igual a null (embora
  // normalizePricingCard já grave null, dado antigo/manual pode ter '').
  //
  // `tagColor` fica null quando não há cor customizada, e é isso que faz o
  // card manter EXATAMENTE a aparência de antes: sem estilo inline, quem
  // pinta a tag continua sendo a classe do kit (.sd-tag--solid, com
  // .sd-tag--orange no card online).
  const cards = [
    hasInPerson && {
      key: 'in-person',
      modifier: 'teal',
      badge: inPersonCard?.tagLabel || t.site.pricingInPersonBadge,
      tagColor: inPersonCard?.tagColor || null,
      price: formatPriceBRL(event.priceInPerson, lang),
      text: inPersonCard?.subtitle || t.site.pricingInPersonText,
      ctaLabel: inPersonCard?.ctaLabel || defaultCtaLabel,
    },
    hasOnline && {
      key: 'online',
      modifier: 'brand',
      badge: onlineCard?.tagLabel || t.site.pricingOnlineBadge,
      tagColor: onlineCard?.tagColor || null,
      price: formatPriceBRL(event.priceOnline, lang),
      text: onlineCard?.subtitle || t.site.pricingOnlineText,
      ctaLabel: onlineCard?.ctaLabel || defaultCtaLabel,
    },
  ].filter(Boolean);

  // Reseta o slide ativo se o card correspondente sumir entre trocas de
  // evento (um preço nulo é o único jeito de a contagem de cards mudar).
  useEffect(() => {
    setIndex((prev) => (prev < cards.length ? prev : 0));
  }, [cards.length]);

  useEffect(() => {
    if (paused || cards.length < 2) return;
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;

    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % cards.length);
    }, AUTO_SLIDE_MS);
    return () => clearInterval(timer);
  }, [paused, cards.length]);

  if (cards.length === 0) return null;

  const ctaLink = event.ctaLink?.trim() || '';

  function step(delta) {
    setIndex((prev) => (prev + delta + cards.length) % cards.length);
  }

  return (
    <section className="sd-section sd-section--tight">
      <div className="sd-container">
        <div
          className="sdp-pricing"
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
          onFocus={() => setPaused(true)}
          onBlur={() => setPaused(false)}
        >
          <div className="sdp-pricing__track">
            {cards.map((card, cardIndex) => (
              <article
                key={card.key}
                className={`sdp-pricing__card sdp-pricing__card--${card.modifier}${
                  cardIndex === index ? ' sdp-pricing__card--active' : ''
                }`}
              >
                <span
                  className={`sd-tag sd-tag--solid${card.modifier === 'brand' ? ' sd-tag--orange' : ''}`}
                  style={card.tagColor ? { backgroundColor: card.tagColor } : undefined}
                >
                  {card.badge}
                </span>
                <p className="sd-display sd-display--lg sd-display--on-dark sdp-pricing__price">
                  {card.price}
                </p>
                <p className="sd-lead sd-on-dark">{card.text}</p>
                {ctaLink && (
                  <a
                    className="sd-btn sd-btn--on-dark"
                    href={ctaLink}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {card.ctaLabel}
                  </a>
                )}
              </article>
            ))}
          </div>

          {cards.length > 1 && (
            <div className="sdp-pricing__nav">
              <button
                type="button"
                className="sdp-carousel__btn"
                onClick={() => step(-1)}
                aria-label={t.site.pricingPrev}
              >
                <ChevronLeft size={20} aria-hidden="true" />
              </button>
              <button
                type="button"
                className="sdp-carousel__btn"
                onClick={() => step(1)}
                aria-label={t.site.pricingNext}
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

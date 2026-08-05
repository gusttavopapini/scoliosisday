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
import { formatPriceBRL } from '../../../../utils/formatCurrency.js';

const AUTO_SLIDE_MS = 5000;

/** @param {{ event: object }} props */
export default function EditionPricing({ event }) {
  const { t, lang } = useLanguage();
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  const hasInPerson = typeof event.priceInPerson === 'number';
  const hasOnline = typeof event.priceOnline === 'number';

  const cards = [
    hasInPerson && {
      key: 'in-person',
      modifier: 'teal',
      badge: t.site.pricingInPersonBadge,
      price: formatPriceBRL(event.priceInPerson, lang),
      text: t.site.pricingInPersonText,
    },
    hasOnline && {
      key: 'online',
      modifier: 'brand',
      badge: t.site.pricingOnlineBadge,
      price: formatPriceBRL(event.priceOnline, lang),
      text: t.site.pricingOnlineText,
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

  const ctaLabel = event.cta?.trim() || t.site.cta;
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
                <span className={`sd-tag sd-tag--solid${card.modifier === 'brand' ? ' sd-tag--orange' : ''}`}>
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
                    {ctaLabel}
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

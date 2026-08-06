// src/features/public/components/HomeHero.jsx
// Seção 1 da Home: carrossel do hero, combinando o banner do evento atual
// (isCurrent:true) com os banners manuais ativos (/painel/banners).
//
// Um único array ordenado por posição (bannerOrder do evento, order dos
// banners manuais, mesmo espaço numérico) alimenta slides do MESMO template
// visual de antes — <picture> por breakpoint, scrim escuro, conteúdo
// centrado na base. Sem evento atual e sem banner manual ativo, a seção
// inteira some (convenção já usada noutras seções vazias do site).

import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useLanguage } from '../../../hooks/useLanguage.js';
import { useCurrentPublicEvent } from '../../../hooks/useEvents.js';
import { useBanners } from '../../../hooks/useBanners.js';
import { useTranslatedContent } from '../../../hooks/useTranslatedContent.js';
import { eventBannerUrl } from '../../../utils/eventBanner.js';

/** Os mesmos pontos de corte do CSS do hero (1024/640). */
const TABLET_MEDIA = '(max-width: 1024px)';
const MOBILE_MEDIA = '(max-width: 640px)';

const AUTO_SLIDE_MS = 3000;

/**
 * Combina o evento atual com os banners manuais ativos num único array de
 * slides, ordenado. Sem bannerOrder no evento (documentos antigos, de antes
 * deste campo existir), a posição vira 0 — o evento aparece primeiro, igual
 * ao comportamento de quando ele era o único slide possível.
 */
function buildSlides(event, banners) {
  const slides = [];

  if (event) {
    slides.push({
      id: `event-${event.id}`,
      order: event.bannerOrder ?? 0,
      headline: event.headline,
      subtitle: event.subtitle,
      cta: event.cta,
      ctaLink: event.ctaLink,
      bannerDesktopUrl: eventBannerUrl(event, 'desktop'),
      bannerTabletUrl: event.bannerTabletUrl?.trim() || '',
      bannerMobileUrl: event.bannerMobileUrl?.trim() || '',
      // Só o slide do evento cai em /edicoes quando não tem link próprio —
      // era o comportamento de antes do carrossel, e um banner manual sem
      // link não tem um destino óbvio equivalente.
      fallbackLink: '/edicoes',
    });
  }

  for (const banner of banners) {
    if (!banner.active) continue;
    slides.push({
      id: `banner-${banner.id}`,
      order: banner.order ?? 0,
      headline: banner.headline,
      subtitle: banner.subtitle,
      cta: banner.cta,
      ctaLink: banner.ctaLink,
      bannerDesktopUrl: banner.bannerDesktopUrl?.trim() || '',
      bannerTabletUrl: banner.bannerTabletUrl?.trim() || '',
      bannerMobileUrl: banner.bannerMobileUrl?.trim() || '',
      fallbackLink: '',
    });
  }

  return slides.sort((a, b) => a.order - b.order);
}

export default function HomeHero() {
  const { t } = useLanguage();
  const { data: event } = useCurrentPublicEvent();
  const { data: allBanners = [] } = useBanners();

  const slides = useMemo(() => buildSlides(event, allBanners), [event, allBanners]);

  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  // Evento saiu do destaque / banner foi desativado enquanto este era o
  // slide visível: volta pro início em vez de apontar pra um índice vazio.
  useEffect(() => {
    setIndex((prev) => (prev < slides.length ? prev : 0));
  }, [slides.length]);

  useEffect(() => {
    if (paused || slides.length < 2) return;
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;

    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % slides.length);
    }, AUTO_SLIDE_MS);
    return () => clearInterval(timer);
    // index nas deps: setas manuais (goTo) reiniciam a contagem, pra não
    // competir com o clique do usuário (mesmo padrão de TestimonialStack.jsx).
  }, [paused, slides.length, index]);

  const slide = slides[index];

  // Só o texto digitado pelo admin (evento real ou banner manual) passa pela
  // API de tradução — sem slide não há o que traduzir.
  const { translated, isTranslating } = useTranslatedContent(slide, ['headline', 'subtitle', 'cta']);

  if (!slide) return null;

  const desktopUrl = slide.bannerDesktopUrl;
  const hasBanner = Boolean(desktopUrl);

  const headline = translated?.headline ?? slide.headline;
  const subtitle = translated?.subtitle ?? slide.subtitle;

  const hasOwnLink = Boolean(slide.ctaLink);
  const showFallbackLink = !hasOwnLink && Boolean(slide.fallbackLink);
  const ctaLabel = (translated?.cta ?? slide.cta)?.trim() || t.site.cta;

  function goTo(nextIndex) {
    setIndex((nextIndex + slides.length) % slides.length);
  }

  return (
    <section
      className="sdp-hero"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div className={`sdp-hero__frame${hasBanner ? '' : ' sdp-hero--brand sd-dots'}`}>
        <div key={slide.id} className="sdp-hero__slide sdp-carousel__slide">
          {hasBanner && (
            <div className="sdp-hero__media" aria-hidden="true">
              <picture>
                {slide.bannerMobileUrl && <source media={MOBILE_MEDIA} srcSet={slide.bannerMobileUrl} />}
                {slide.bannerTabletUrl && <source media={TABLET_MEDIA} srcSet={slide.bannerTabletUrl} />}
                <img src={desktopUrl} alt="" />
              </picture>
            </div>
          )}

          <div className="sdp-hero__content">
            <h1 className="sd-display sd-display--lg sd-display--on-dark">
              <span className={isTranslating ? 'sdp-translating' : undefined}>{headline}</span>
            </h1>
            <div className="sd-rule" aria-hidden="true">
              <i /><i /><i /><i /><i />
            </div>
            {subtitle && (
              <p className="sd-lead sd-on-dark">
                <span className={isTranslating ? 'sdp-translating' : undefined}>{subtitle}</span>
              </p>
            )}

            {hasOwnLink && (
              <a
                className="sd-btn sd-btn--primary sd-btn--lg"
                href={slide.ctaLink}
                target="_blank"
                rel="noopener noreferrer"
              >
                <span className={isTranslating ? 'sdp-translating' : undefined}>{ctaLabel}</span>
              </a>
            )}
            {showFallbackLink && (
              <Link className="sd-btn sd-btn--primary sd-btn--lg" to={slide.fallbackLink}>
                <span className={isTranslating ? 'sdp-translating' : undefined}>{ctaLabel}</span>
              </Link>
            )}
          </div>
        </div>

        {slides.length > 1 && (
          <>
            <button
              type="button"
              className="sdp-hero__nav sdp-hero__nav--prev sdp-carousel__btn"
              onClick={() => goTo(index - 1)}
              aria-label={t.common.back}
            >
              <ChevronLeft size={20} aria-hidden="true" />
            </button>
            <button
              type="button"
              className="sdp-hero__nav sdp-hero__nav--next sdp-carousel__btn"
              onClick={() => goTo(index + 1)}
              aria-label={t.common.next}
            >
              <ChevronRight size={20} aria-hidden="true" />
            </button>

            <div className="sdp-hero__dots sdp-carousel__dots" role="tablist" aria-label="Slides do carrossel">
              {slides.map((s, i) => (
                <button
                  key={s.id}
                  type="button"
                  role="tab"
                  aria-selected={i === index}
                  aria-label={`${i + 1}`}
                  className={`sdp-carousel__dot${i === index ? ' sdp-carousel__dot--active' : ''}`}
                  onClick={() => goTo(i)}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </section>
  );
}

// src/features/public/components/HomeHero.jsx
// Seção 1 da Home: hero com o banner do evento atual publicado.
//
// Com evento: <picture> escolhe a arte por breakpoint (mobile/tablet/desktop),
// com o campo legado `banner` na cascata via eventBannerUrl. O scrim escuro
// garante contraste do texto sobre qualquer arte.
// Sem evento (ou sem banner): fundo --grad-hero com textura de pontos, textos
// do dicionário e CTA apontando para /edicoes.

import { Link } from 'react-router-dom';
import { useLanguage } from '../../../hooks/useLanguage.js';
import { useCurrentPublicEvent } from '../../../hooks/useEvents.js';
import { eventBannerUrl } from '../../../utils/eventBanner.js';

/** Os mesmos pontos de corte do CSS do hero (1024/640). */
const TABLET_MEDIA = '(max-width: 1024px)';
const MOBILE_MEDIA = '(max-width: 640px)';

export default function HomeHero() {
  const { t } = useLanguage();
  const { data: event } = useCurrentPublicEvent();

  const desktopUrl = eventBannerUrl(event, 'desktop');
  const hasBanner = Boolean(event && desktopUrl);

  // Sem trim: os campos específicos já passam por eventBannerUrl; aqui só
  // interessa se o específico existe para virar <source> próprio.
  const tabletUrl = event?.bannerTabletUrl?.trim() || '';
  const mobileUrl = event?.bannerMobileUrl?.trim() || '';

  const headline = event ? event.headline : t.site.heroTitle;
  const subtitle = event ? event.subtitle : t.site.heroSubtitle;

  const ctaLabel = event?.cta?.trim() || t.site.cta;
  const ctaLink = event?.ctaLink?.trim() || '';

  return (
    <section className={`sdp-hero${hasBanner ? '' : ' sdp-hero--brand sd-dots'}`}>
      {hasBanner && (
        <div className="sdp-hero__media" aria-hidden="true">
          <picture>
            {mobileUrl && <source media={MOBILE_MEDIA} srcSet={mobileUrl} />}
            {tabletUrl && <source media={TABLET_MEDIA} srcSet={tabletUrl} />}
            <img src={desktopUrl} alt="" />
          </picture>
        </div>
      )}

      <div className="sdp-hero__content sd-container">
        <h1 className="sd-display sd-display--lg sd-display--on-dark">{headline}</h1>
        <div className="sd-rule" aria-hidden="true">
          <i /><i /><i /><i /><i />
        </div>
        {subtitle && <p className="sd-lead sd-on-dark">{subtitle}</p>}

        {ctaLink ? (
          <a
            className="sd-btn sd-btn--primary sd-btn--lg"
            href={ctaLink}
            target="_blank"
            rel="noopener noreferrer"
          >
            {ctaLabel}
          </a>
        ) : (
          <Link className="sd-btn sd-btn--primary sd-btn--lg" to="/edicoes">
            {ctaLabel}
          </Link>
        )}
      </div>
    </section>
  );
}

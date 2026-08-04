// src/features/public/components/editions/EditionHero.jsx
// Seção 1 de /edicoes: banner com borda de respiro, não full-bleed — ao
// contrário do hero da Home, que ocupa a tela inteira. A cascata de banner
// (mobile/tablet/desktop, com fallback no campo legado) é a mesma da Home.

import { useLanguage } from '../../../../hooks/useLanguage.js';
import { eventBannerUrl } from '../../../../utils/eventBanner.js';

const TABLET_MEDIA = '(max-width: 1024px)';
const MOBILE_MEDIA = '(max-width: 640px)';

/** @param {{ event: object, editionBadge?: string }} props */
export default function EditionHero({ event, editionBadge }) {
  const { t } = useLanguage();

  const desktopUrl = eventBannerUrl(event, 'desktop');
  const hasBanner = Boolean(desktopUrl);
  const tabletUrl = event.bannerTabletUrl?.trim() || '';
  const mobileUrl = event.bannerMobileUrl?.trim() || '';

  const ctaLabel = event.cta?.trim() || t.site.cta;
  const ctaLink = event.ctaLink?.trim() || '';

  return (
    <section className="sdp-edition-hero">
      <div className={`sdp-edition-hero__frame${hasBanner ? '' : ' sdp-edition-hero__frame--brand sd-dots'}`}>
        {hasBanner && (
          <div className="sdp-edition-hero__media" aria-hidden="true">
            <picture>
              {mobileUrl && <source media={MOBILE_MEDIA} srcSet={mobileUrl} />}
              {tabletUrl && <source media={TABLET_MEDIA} srcSet={tabletUrl} />}
              <img src={desktopUrl} alt="" />
            </picture>
          </div>
        )}

        <div className="sdp-edition-hero__content">
          {editionBadge && <span className="sd-tag sd-tag--solid">{editionBadge}</span>}
          <h1 className="sd-display sd-display--lg sd-display--on-dark sdp-edition-hero__headline">
            {event.headline}
          </h1>
          <div className="sd-rule" aria-hidden="true">
            <i /><i /><i /><i /><i />
          </div>
          {event.subtitle && <p className="sd-lead sd-on-dark">{event.subtitle}</p>}

          {ctaLink && (
            <a
              className="sd-btn sd-btn--primary sd-btn--lg"
              href={ctaLink}
              target="_blank"
              rel="noopener noreferrer"
            >
              {ctaLabel}
            </a>
          )}
        </div>
      </div>
    </section>
  );
}

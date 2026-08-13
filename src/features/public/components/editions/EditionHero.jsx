// src/features/public/components/editions/EditionHero.jsx
// Seção 1 de /edicoes: banner com borda de respiro, não full-bleed — ao
// contrário do hero da Home, que ocupa a tela inteira. A cascata de banner
// (mobile/tablet/desktop, com fallback no campo legado) é a mesma da Home.

import { useLanguage } from '../../../../hooks/useLanguage.js';
import { useStoredTranslation } from '../../../../hooks/useStoredTranslation.js';
import { eventBannerUrl } from '../../../../utils/eventBanner.js';

const TABLET_MEDIA = '(max-width: 1024px)';
const MOBILE_MEDIA = '(max-width: 640px)';

/** @param {{ event: object, editionBadge?: string }} props */
export default function EditionHero({ event, editionBadge }) {
  const { t } = useLanguage();
  const translated = useStoredTranslation(event, ['headline', 'subtitle', 'cta']);

  const desktopUrl = eventBannerUrl(event, 'desktop');
  const hasBanner = Boolean(desktopUrl);
  const tabletUrl = event.bannerTabletUrl?.trim() || '';
  const mobileUrl = event.bannerMobileUrl?.trim() || '';

  const ctaLabel = translated.cta?.trim() || t.site.cta;
  const ctaLink = event.ctaLink?.trim() || '';

  // Cor customizada do botão (painel, Passo 1 do wizard) — sem valor,
  // mantém o visual padrão de .sd-btn--primary (mesmo hex do design
  // system, não um token novo, pra edição sem cor customizada ficar igual
  // a hoje — mesmo cálculo de HomeHero.jsx, único outro lugar com esse botão).
  const ctaButtonStyle = {
    backgroundColor: event.ctaButtonBg || 'var(--orange-600)',
    borderColor: event.ctaButtonBg || 'var(--orange-600)',
    color: event.ctaButtonText || 'var(--white)',
  };

  return (
    <section className="sdp-edition-hero">
      <div className={`sdp-edition-hero__frame${hasBanner ? '' : ' sd-dots'}`}>
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
            {translated.headline}
          </h1>
          <div
            className="sd-rule"
            aria-hidden="true"
            style={event.separatorColor ? { '--rule-color': event.separatorColor } : undefined}
          >
            <i /><i /><i /><i /><i />
          </div>
          {translated.subtitle && (
            <p className="sd-lead sd-on-dark">
              {translated.subtitle}
            </p>
          )}

          {event.isCurrent && ctaLink && (
            <a
              className="sd-btn sd-btn--primary sd-btn--lg"
              href={ctaLink}
              target="_blank"
              rel="noopener noreferrer"
              style={ctaButtonStyle}
            >
              {ctaLabel}
            </a>
          )}
        </div>
      </div>
    </section>
  );
}

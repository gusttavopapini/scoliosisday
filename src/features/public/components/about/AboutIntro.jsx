// src/features/public/components/about/AboutIntro.jsx
// Seção 2 de /sobre: texto institucional centralizado + três cards com
// hover (.sdp-hover-card), conteúdo 100% estático via dicionário.

import { Stethoscope, MessageCircle, Users } from 'lucide-react';
import { useLanguage } from '../../../../hooks/useLanguage.js';

const CARDS = [
  { icon: Stethoscope, titleKey: 'aboutPageCard1Title', textKey: 'aboutPageCard1Text' },
  { icon: MessageCircle, titleKey: 'aboutPageCard2Title', textKey: 'aboutPageCard2Text' },
  { icon: Users, titleKey: 'aboutPageCard3Title', textKey: 'aboutPageCard3Text' },
];

export default function AboutIntro() {
  const { t } = useLanguage();

  return (
    <section className="sd-section">
      <div className="sd-container">
        <header className="sd-section-header sd-section-header--center sdp-section-header">
          <h2 className="sd-display sd-display--md sd-display--upright sd-display--teal">
            {t.site.aboutPageIntroTitle}
          </h2>
          <div className="sd-rule" aria-hidden="true">
            <i /><i /><i /><i /><i />
          </div>
        </header>

        <p className="sd-lead sdp-about-intro__text">{t.site.aboutPageIntroText}</p>

        <div className="sd-grid sd-grid--3">
          {CARDS.map(({ icon: Icon, titleKey, textKey }) => (
            <article key={titleKey} className="sd-card sd-card--accent sdp-hover-card">
              <span className="sd-icon-badge" aria-hidden="true">
                <Icon size={26} />
              </span>
              <h3 className="sd-card__title">{t.site[titleKey]}</h3>
              <p className="sd-card__body">{t.site[textKey]}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

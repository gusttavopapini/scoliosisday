// src/features/public/components/HomeAbout.jsx
// Seção 2 da Home: o que é o Scoliosis Day — três cards institucionais.
// Conteúdo 100% estático, direto do dicionário.

import { GraduationCap, Users, Award } from 'lucide-react';
import { useLanguage } from '../../../hooks/useLanguage.js';
import BrandWordmark from '../../../components/BrandWordmark.jsx';

const CARDS = [
  { icon: GraduationCap, titleKey: 'aboutCard1Title', textKey: 'aboutCard1Text' },
  { icon: Users, titleKey: 'aboutCard2Title', textKey: 'aboutCard2Text' },
  { icon: Award, titleKey: 'aboutCard3Title', textKey: 'aboutCard3Text' },
];

export default function HomeAbout() {
  const { t } = useLanguage();

  return (
    <section className="sd-section">
      <div className="sd-container">
        <header className="sd-section-header sdp-section-header">
          <h2 className="sd-display sd-display--md sd-display--upright sd-display--teal sdp-about-heading">
            {t.site.aboutTitleMain} <BrandWordmark />
          </h2>
          <div className="sd-rule" aria-hidden="true">
            <i /><i /><i /><i /><i />
          </div>
          <p className="sd-lead">{t.site.aboutSubtitle}</p>
        </header>

        <div className="sd-grid sd-grid--3 sdp-about__grid">
          {CARDS.map(({ icon: Icon, titleKey, textKey }) => (
            <article key={titleKey} className="sd-card sd-card--accent sdp-feature-card sdp-hover-card">
              <span className="sd-icon-badge sd-icon-badge--lg" aria-hidden="true">
                <Icon size={30} />
              </span>
              <h3 className="sd-display sd-display--sm sd-display--upright">{t.site[titleKey]}</h3>
              <p className="sd-card__body">{t.site[textKey]}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

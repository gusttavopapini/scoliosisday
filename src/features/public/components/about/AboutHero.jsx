// src/features/public/components/about/AboutHero.jsx
// Seção 1 de /sobre: hero institucional em --grad-teal, sem depender de
// nenhum evento — ao contrário do hero da Home, este texto é sempre fixo.

import { useLanguage } from '../../../../hooks/useLanguage.js';

export default function AboutHero() {
  const { t } = useLanguage();

  return (
    <section className="sdp-about-hero sd-dots">
      <div className="sd-container sdp-about-hero__inner">
        <h1 className="sd-display sd-display--lg sd-display--on-dark">{t.site.aboutPageHeroTitle}</h1>
        <p className="sd-lead sd-on-dark">{t.site.aboutPageHeroSubtitle}</p>
      </div>
    </section>
  );
}

// src/features/public/components/editions/EditionPresentation.jsx
// Seção 4 de /edicoes: os 3 cards de apresentação gravados no próprio
// evento (event.presentation, Passo 3 do wizard) — não mais o HomeAbout
// estático. O título/subtítulo institucional continua fixo (é o mesmo
// discurso em toda edição); só os 3 cards mudam por evento.

import { useLanguage } from '../../../../hooks/useLanguage.js';
import { getPresentationIcon, hasValidPresentation } from '../../../../utils/presentationIcons.js';

/** @param {{ event: object }} props */
export default function EditionPresentation({ event }) {
  const { t } = useLanguage();
  const cards = event.presentation ?? [];

  if (!hasValidPresentation(cards)) return null;

  return (
    <section className="sd-section">
      <div className="sd-container">
        <header className="sd-section-header sdp-section-header">
          <h2 className="sd-display sd-display--md sd-display--upright sd-display--teal">
            {t.site.aboutTitle}
          </h2>
          <div className="sd-rule" aria-hidden="true">
            <i /><i /><i /><i /><i />
          </div>
          <p className="sd-lead">{t.site.aboutSubtitle}</p>
        </header>

        <div className="sd-grid sd-grid--3 sdp-about__grid">
          {cards.map((card, index) => {
            const Icon = getPresentationIcon(card.icon);
            return (
              <article key={index} className="sd-card sd-card--accent">
                <span className="sd-icon-badge" aria-hidden="true">
                  <Icon size={26} />
                </span>
                <h3 className="sd-card__title">{card.title}</h3>
                <p className="sd-card__body">{card.description}</p>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}

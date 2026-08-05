// src/features/public/components/editions/EditionPresentation.jsx
// Seção 4 de /edicoes: os 3 cards de apresentação gravados no próprio
// evento (event.presentation, Passo 3 do wizard) — não mais o HomeAbout
// estático. O título/subtítulo institucional continua fixo (é o mesmo
// discurso em toda edição); só os 3 cards mudam por evento.

import { useLanguage } from '../../../../hooks/useLanguage.js';
import { hasValidPresentation } from '../../../../utils/presentationIcons.js';
import BrandWordmark from '../../../../components/BrandWordmark.jsx';
import PresentationCard from './PresentationCard.jsx';

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
            {t.site.aboutTitleMain} <BrandWordmark />
          </h2>
          <div className="sd-rule" aria-hidden="true">
            <i /><i /><i /><i /><i />
          </div>
          <p className="sd-lead">{t.site.aboutSubtitle}</p>
        </header>

        <div className="sd-grid sd-grid--3 sdp-about__grid">
          {cards.map((card, index) => (
            <PresentationCard key={index} card={card} />
          ))}
        </div>
      </div>
    </section>
  );
}

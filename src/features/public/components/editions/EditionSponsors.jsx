// src/features/public/components/editions/EditionSponsors.jsx
// Seção 6 de /edicoes: patrocinadores do evento, em .sd-logo-strip.

import { useLanguage } from '../../../../hooks/useLanguage.js';

/** @param {{ event: object, sponsorsById: Map<string, object> }} props */
export default function EditionSponsors({ event, sponsorsById }) {
  const { t } = useLanguage();

  const sponsors = (event.sponsors ?? [])
    .map((id) => sponsorsById.get(id))
    .filter(Boolean);

  if (sponsors.length === 0) return null;

  return (
    <section className="sd-section sd-section--tight sdp-sponsors">
      <div className="sd-container">
        <header className="sd-section-header sd-section-header--center sdp-section-header">
          <h2 className="sd-display sd-display--md sd-display--upright sd-display--teal">
            {t.site.sponsorsTitle}
          </h2>
        </header>

        <div className="sd-logo-strip">
          <div className="sd-logo-strip__items">
            {sponsors.map((sponsor) => (
              <a
                key={sponsor.id}
                href={sponsor.website}
                target="_blank"
                rel="noopener noreferrer"
                className="sdp-sponsors__link"
              >
                {sponsor.logoUrl ? (
                  <img className="sdp-sponsors__logo" src={sponsor.logoUrl} alt={sponsor.name} />
                ) : (
                  <span className="sd-logo-strip__ph">{sponsor.name}</span>
                )}
              </a>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

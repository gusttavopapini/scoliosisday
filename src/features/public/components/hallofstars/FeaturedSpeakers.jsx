// src/features/public/components/hallofstars/FeaturedSpeakers.jsx
// Seção 1 de /hall-de-estrelas: palestrantes marcados como destaque
// (starSpeakerIds) em qualquer edição publicada. Sem gente para mostrar,
// a seção inteira some.

import PersonCard from '../editions/PersonCard.jsx';

/** @param {{ title: string, badge: string, people: object[] }} props */
export default function FeaturedSpeakers({ title, badge, people }) {
  if (people.length === 0) return null;

  return (
    <section className="sd-section sd-section--tight">
      <div className="sd-container">
        <header className="sd-section-header sdp-section-header">
          <h2 className="sd-display sd-display--md sd-display--upright sd-display--teal sdp-heading--regular">{title}</h2>
          <div className="sd-rule" aria-hidden="true">
            <i /><i /><i /><i /><i />
          </div>
        </header>

        <div className="sd-grid sd-grid--4">
          {people.map((person) => (
            <PersonCard key={person.id} person={person} badge={badge} className="sdp-people-card--clamp-2" />
          ))}
        </div>
      </div>
    </section>
  );
}

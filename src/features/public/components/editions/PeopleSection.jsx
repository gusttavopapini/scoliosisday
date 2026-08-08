// src/features/public/components/editions/PeopleSection.jsx
// Grade de PersonCard com título — usada pelas Seções 2, 7 e 8 de /edicoes.
// Sem gente para mostrar, a seção inteira some (cada seção da página de
// edição só existe quando há dado real por trás).

import PeopleGrid from './PeopleGrid.jsx';

/**
 * @param {{ title: string, people: object[], headingClassName?: string }} props
 */
export default function PeopleSection({ title, people, headingClassName = '' }) {
  if (people.length === 0) return null;

  return (
    <section className="sd-section sd-section--tight">
      <div className="sd-container">
        <header className="sd-section-header sd-section-header--center sdp-section-header">
          <h2 className={`sd-display sd-display--md sd-display--upright sd-display--teal${headingClassName ? ` ${headingClassName}` : ''}`}>{title}</h2>
          <div className="sd-rule" aria-hidden="true">
            <i /><i /><i /><i /><i />
          </div>
        </header>

        <PeopleGrid people={people} />
      </div>
    </section>
  );
}

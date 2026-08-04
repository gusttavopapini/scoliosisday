// src/features/public/components/editions/PersonCard.jsx
// Card de pessoa do site público — reaproveitado por Presenças Confirmadas,
// Quem faz o Scoliosis Day e Curadoria Científica (Seções 2, 7 e 8 de
// /edicoes). A tag de tipo é opcional porque só a Seção 2 pede.

import AvatarInitials from '../../../../components/ui/AvatarInitials.jsx';
import { useLanguage } from '../../../../hooks/useLanguage.js';

/**
 * @param {{ person: object, showType?: boolean }} props
 */
export default function PersonCard({ person, showType = false }) {
  const { t } = useLanguage();

  return (
    <article className="sd-card sdp-people-card">
      <AvatarInitials
        name={person.fullName}
        photoUrl={person.photoUrl}
        id={person.id}
        className="sdp-avatar"
      />
      <h3 className="sd-card__title sdp-people-card__name">{person.fullName}</h3>
      {showType && person.type && (
        <span className="sd-tag sd-tag--orange">{t.collaboratorType[person.type]}</span>
      )}
      {person.minibio && (
        <p className="sd-card__body sdp-people-card__bio">{person.minibio}</p>
      )}
    </article>
  );
}

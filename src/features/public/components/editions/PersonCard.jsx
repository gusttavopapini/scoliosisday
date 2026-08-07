// src/features/public/components/editions/PersonCard.jsx
// Card de pessoa do site público — reaproveitado por Presenças Confirmadas,
// Quem faz o Scoliosis Day, Curadoria Científica (Seções 2, 7 e 8 de
// /edicoes) e pelo Hall de Estrelas (Destaque e Todos).
//
// Reformulação: foto sem pill de nome sobreposto, sem cargo/função e sem
// badge "Destaque" visíveis no card — só foto, nome (texto simples) +
// bandeira opcional na mesma linha, e o botão "Ver detalhes" (pill) abaixo,
// os dois alinhados à esquerda. O tipo do colaborador (era usado para o
// cargo no card) e a mini bio (removida numa rodada anterior) continuam
// disponíveis só dentro do modal.

import { useState } from 'react';
import AvatarInitials from '../../../../components/ui/AvatarInitials.jsx';
import { useLanguage } from '../../../../hooks/useLanguage.js';
import { countryFlagEmoji } from '../../../../utils/countryFlags.js';
import PersonModal from './PersonModal.jsx';

/** @param {{ person: object }} props */
export default function PersonCard({ person }) {
  const { t } = useLanguage();
  // "Ver detalhes" abre o modal — não há página de detalhe por colaborador
  // no site ainda, então não há pra onde linkar.
  const [showModal, setShowModal] = useState(false);

  const flagEmoji = person.flag ? countryFlagEmoji(person.flag) : '';
  const typeLabel = person.type ? t.collaboratorType[person.type] : null;

  return (
    <article className="sd-card sdp-people-card">
      <div className="sdp-people-card__media">
        <AvatarInitials
          name={person.fullName}
          photoUrl={person.photoUrl}
          id={person.id}
          className="sdp-people-card__photo"
        />
      </div>

      <div className="sdp-people-card__row">
        <span className="sdp-people-card__name">{person.fullName}</span>
        {flagEmoji && (
          <span className="sdp-people-card__flag" aria-hidden="true">{flagEmoji}</span>
        )}
      </div>

      <button
        type="button"
        className="sd-btn sd-btn--outline sd-btn--sm sdp-people-card__more"
        onClick={() => setShowModal(true)}
      >
        {t.site.viewMore}
      </button>

      {showModal && (
        <PersonModal
          person={person}
          tagLabel={typeLabel}
          onClose={() => setShowModal(false)}
        />
      )}
    </article>
  );
}

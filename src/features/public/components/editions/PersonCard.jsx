// src/features/public/components/editions/PersonCard.jsx
// Card de pessoa do site público — reaproveitado por Presenças Confirmadas,
// Quem faz o Scoliosis Day, Curadoria Científica (Seções 2, 7 e 8 de
// /edicoes) e pelo Hall de Estrelas. A tag é opcional e tem duas fontes
// possíveis: `showType` mostra o tipo do colaborador (ex.: "Palestrante"),
// `badge` mostra um rótulo fixo escolhido por quem chama (ex.: "Destaque") —
// nunca os dois ao mesmo tempo, badge vence se as duas vierem.
//
// className passa a classe para o <article>: some grade quer o clamp da bio
// em 2 linhas em vez das 3 padrão (.sdp-people-grid), sem precisar de uma
// nova prop dedicada só pra isso.

import { useState } from 'react';
import AvatarInitials from '../../../../components/ui/AvatarInitials.jsx';
import { useLanguage } from '../../../../hooks/useLanguage.js';
import { useTranslatedContent } from '../../../../hooks/useTranslatedContent.js';
import PersonModal from './PersonModal.jsx';

/**
 * @param {{ person: object, showType?: boolean, badge?: string, className?: string }} props
 */
export default function PersonCard({ person, showType = false, badge, className }) {
  const { t } = useLanguage();
  // fullName é nome próprio, nunca traduzido — só a minibio passa pela API.
  const { translated, isTranslating } = useTranslatedContent(person, ['minibio']);
  // "Ver mais" abre o modal de detalhes — não há página de detalhe por
  // colaborador no site ainda, então não há pra onde linkar.
  const [showModal, setShowModal] = useState(false);

  const tagLabel = badge || (showType && person.type ? t.collaboratorType[person.type] : null);

  return (
    <article className={`sd-card sdp-people-card${className ? ` ${className}` : ''}`}>
      <div className="sdp-people-card__media">
        <AvatarInitials
          name={person.fullName}
          photoUrl={person.photoUrl}
          id={person.id}
          className="sdp-people-card__photo"
        />
        <span className="sdp-people-card__name-pill">{person.fullName}</span>
      </div>
      {tagLabel && <p className="sdp-people-card__role">{tagLabel}</p>}
      {translated.minibio && (
        <p className="sd-card__body sdp-people-card__bio">
          <span className={isTranslating ? 'sdp-translating' : undefined}>{translated.minibio}</span>
        </p>
      )}
      {(translated.minibio || person.curriculum) && (
        <button type="button" className="sdp-people-card__more" onClick={() => setShowModal(true)}>
          {t.site.viewMore}
        </button>
      )}

      {showModal && (
        <PersonModal
          person={person}
          tagLabel={tagLabel}
          minibio={translated.minibio}
          isTranslating={isTranslating}
          onClose={() => setShowModal(false)}
        />
      )}
    </article>
  );
}

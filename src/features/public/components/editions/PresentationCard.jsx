// src/features/public/components/editions/PresentationCard.jsx
// Um card da grade de EditionPresentation.jsx. Componente próprio (em vez
// de inline no .map()) porque useStoredTranslation é um hook — chamar hook
// dentro de .map() violaria as regras de hooks para uma lista de tamanho
// variável.

import { useStoredTranslation } from '../../../../hooks/useStoredTranslation.js';
import { getPresentationIcon } from '../../../../utils/presentationIcons.js';
import AcronymSafeText from '../../../../components/public/AcronymSafeText.jsx';

/** @param {{ card: { icon: string, title: string, description: string } }} props */
export default function PresentationCard({ card }) {
  const translated = useStoredTranslation(card, ['title', 'description']);
  const Icon = getPresentationIcon(card.icon);

  return (
    <article className="sd-card sd-card--accent sdp-feature-card sdp-hover-card">
      <span className="sd-icon-badge sd-icon-badge--lg" aria-hidden="true">
        <Icon size={30} />
      </span>
      <h3 className="sd-display sd-display--sm sd-display--upright sdp-feature-card__title">
        <AcronymSafeText text={translated.title} />
      </h3>
      <p className="sd-card__body">
        {translated.description}
      </p>
    </article>
  );
}

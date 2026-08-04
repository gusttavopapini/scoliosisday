// src/features/public/components/editions/PresentationCard.jsx
// Um card da grade de EditionPresentation.jsx. Componente próprio (em vez
// de inline no .map()) porque useTranslatedContent é um hook — chamar hook
// dentro de .map() violaria as regras de hooks para uma lista de tamanho
// variável.

import { useTranslatedContent } from '../../../../hooks/useTranslatedContent.js';
import { getPresentationIcon } from '../../../../utils/presentationIcons.js';

/** @param {{ card: { icon: string, title: string, description: string } }} props */
export default function PresentationCard({ card }) {
  const { translated, isTranslating } = useTranslatedContent(card, ['title', 'description']);
  const Icon = getPresentationIcon(card.icon);

  return (
    <article className="sd-card sd-card--accent">
      <span className="sd-icon-badge" aria-hidden="true">
        <Icon size={26} />
      </span>
      <h3 className="sd-card__title">
        <span className={isTranslating ? 'sdp-translating' : undefined}>{translated.title}</span>
      </h3>
      <p className="sd-card__body">
        <span className={isTranslating ? 'sdp-translating' : undefined}>{translated.description}</span>
      </p>
    </article>
  );
}

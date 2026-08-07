// src/features/public/components/editions/ArchiveStatCard.jsx
// Uma coluna de estatística da página de arquivo (EditionArchive.jsx).
// Componente próprio (não inline no .map()) pelo mesmo motivo de
// PresentationCard.jsx: useTranslatedContent é um hook, e a lista de
// estatísticas varia (só as com `value` preenchido chegam aqui).

import { useTranslatedContent } from '../../../../hooks/useTranslatedContent.js';

/** @param {{ stat: { prefix?: string, value?: string, suffix?: string, title?: string, description?: string } }} props */
export default function ArchiveStatCard({ stat }) {
  const { translated, isTranslating } = useTranslatedContent(stat, ['title', 'description']);

  return (
    <div className="sd-stat sdp-archive-stat">
      <span className="sd-stat__value">
        {stat.prefix && <i>{stat.prefix}</i>}
        {stat.value}
        {stat.suffix && <i>{stat.suffix}</i>}
      </span>

      {translated.title && (
        <h3 className="sdp-archive-stat__title">
          <span className={isTranslating ? 'sdp-translating' : undefined}>{translated.title}</span>
        </h3>
      )}

      {translated.description && (
        <p className="sdp-archive-stat__text">
          <span className={isTranslating ? 'sdp-translating' : undefined}>{translated.description}</span>
        </p>
      )}
    </div>
  );
}

// src/features/public/components/editions/ArchiveStatCard.jsx
// Uma coluna de estatística da página de arquivo (EditionArchive.jsx).
// Componente próprio (não inline no .map()) pelo mesmo motivo de
// PresentationCard.jsx: a lista de estatísticas varia (só as com `value`
// preenchido chegam aqui) — não afeta hooks aqui dentro (useStoredTranslation
// é síncrono), mas mantém o padrão consistente entre os dois cards.

import { useStoredTranslation } from '../../../../hooks/useStoredTranslation.js';

/** @param {{ stat: { prefix?: string, value?: string, suffix?: string, title?: string, description?: string } }} props */
export default function ArchiveStatCard({ stat }) {
  const translated = useStoredTranslation(stat, ['title', 'description']);

  return (
    <div className="sd-stat sdp-archive-stat">
      <span className="sd-stat__value">
        {stat.prefix && <i>{stat.prefix}</i>}
        {stat.value}
        {stat.suffix && <i>{stat.suffix}</i>}
      </span>

      {translated.title && (
        <h3 className="sdp-archive-stat__title">{translated.title}</h3>
      )}

      {translated.description && (
        <p className="sdp-archive-stat__text">{translated.description}</p>
      )}
    </div>
  );
}

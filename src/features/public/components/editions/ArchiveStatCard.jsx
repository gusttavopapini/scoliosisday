// src/features/public/components/editions/ArchiveStatCard.jsx
// Uma coluna de estatística da página de arquivo (EditionArchive.jsx).
// Componente próprio (não inline no .map()) pelo mesmo motivo de
// PresentationCard.jsx: a lista de estatísticas varia (só as com `value`
// preenchido chegam aqui) — não afeta hooks aqui dentro (useStoredTranslation
// é síncrono), mas mantém o padrão consistente entre os dois cards.
//
// prefix/suffix saíram da exibição (só valor) — o formulário no painel não
// os edita mais. Campos continuam no schema/Firestore por edições antigas
// que já os tinham preenchido; só param de ser lidos aqui.

import { useStoredTranslation } from '../../../../hooks/useStoredTranslation.js';

/** @param {{ stat: { value?: string, title?: string, description?: string } }} props */
export default function ArchiveStatCard({ stat }) {
  const translated = useStoredTranslation(stat, ['title', 'description']);

  return (
    <div className="sd-stat sdp-archive-stat">
      <span className="sd-stat__value">{stat.value}</span>

      {translated.title && (
        <h3 className="sdp-archive-stat__title">{translated.title}</h3>
      )}

      {translated.description && (
        <p className="sdp-archive-stat__text">{translated.description}</p>
      )}
    </div>
  );
}

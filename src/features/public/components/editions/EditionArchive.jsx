// src/features/public/components/editions/EditionArchive.jsx
// Corpo de /edicoes para uma edição PASSADA (isCurrent: false) — substitui
// por completo o corpo padrão (Presenças, O que é o Scoliosis Day,
// Programação, Curadoria) que continua valendo só pra edição atual. Ver
// EditionsPage.jsx pela escolha entre os dois corpos.
//
// Oculta a seção inteira sem archiveTitle (edições antigas, cadastradas
// antes deste recurso existir, não têm nenhum dado neste formato — ver
// hasArchiveContent em utils/eventArchive.js). Dentro dela, leque de fotos
// e estatísticas se ocultam de forma independente, cada um só quando não
// há dado próprio.

import { useTranslatedContent } from '../../../../hooks/useTranslatedContent.js';
import {
  hasArchiveContent,
  getFeaturedGalleryImages,
  hasArchiveStat,
} from '../../../../utils/eventArchive.js';
import ArchiveFanGallery from './ArchiveFanGallery.jsx';
import ArchiveStatCard from './ArchiveStatCard.jsx';

/** @param {{ event: object }} props */
export default function EditionArchive({ event }) {
  const { translated, isTranslating } = useTranslatedContent(event, ['archiveTitle', 'archiveSubtitle']);

  if (!hasArchiveContent(event)) return null;

  const gallery = event.gallery ?? [];
  const featured = getFeaturedGalleryImages(gallery);
  const stats = (event.archiveStats ?? []).filter(hasArchiveStat);

  return (
    <section className="sd-section">
      <div className="sd-container">
        <header className="sd-section-header sd-section-header--center sdp-section-header">
          <h2 className="sd-display sd-display--md sd-display--upright sd-display--teal sdp-heading--regular">
            <span className={isTranslating ? 'sdp-translating' : undefined}>{translated.archiveTitle}</span>
          </h2>
          <div className="sd-rule" aria-hidden="true">
            <i /><i /><i /><i /><i />
          </div>
          {translated.archiveSubtitle && (
            <p className="sd-lead">
              <span className={isTranslating ? 'sdp-translating' : undefined}>{translated.archiveSubtitle}</span>
            </p>
          )}
        </header>

        <ArchiveFanGallery gallery={gallery} featured={featured} title={translated.archiveTitle} />

        {stats.length > 0 && (
          <div className="sd-grid sd-grid--3 sdp-archive-stats">
            {stats.map((stat, index) => (
              <ArchiveStatCard key={index} stat={stat} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

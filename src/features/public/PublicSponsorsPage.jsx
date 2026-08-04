// src/features/public/PublicSponsorsPage.jsx
// Página institucional /patrocinadores: todos os patrocinadores vinculados
// a qualquer edição publicada, agregados de TODAS elas — não só a mais
// recente (mesmo padrão de /hall-de-estrelas).

import { useMemo } from 'react';
import { useLanguage } from '../../hooks/useLanguage.js';
import { usePublishedEvents } from '../../hooks/useEvents.js';
import { useSponsors } from '../../hooks/useSponsors.js';
import { collectUniqueIds } from '../../utils/collaborators.js';
import SimpleHero from '../../components/public/SimpleHero.jsx';
import AllSponsors from './components/sponsors/AllSponsors.jsx';
import SponsorCta from './components/SponsorCta.jsx';

export default function PublicSponsorsPage() {
  const { t } = useLanguage();
  const { data: publishedEvents = [] } = usePublishedEvents();
  const { data: allSponsors = [] } = useSponsors();

  const sponsorsById = useMemo(
    () => new Map(allSponsors.map((s) => [s.id, s])),
    [allSponsors],
  );

  const sponsors = useMemo(() => {
    const ids = collectUniqueIds(publishedEvents, 'sponsors');
    return ids.map((id) => sponsorsById.get(id)).filter(Boolean);
  }, [publishedEvents, sponsorsById]);

  return (
    <>
      <SimpleHero
        title={t.site.sponsorsPageHeroTitle}
        subtitle={t.site.sponsorsPageHeroSubtitle}
      />

      <AllSponsors
        emptyTitle={t.site.sponsorsPageEmptyTitle}
        emptyBody={t.site.sponsorsPageEmptyBody}
        sponsors={sponsors}
      />

      <SponsorCta />
    </>
  );
}

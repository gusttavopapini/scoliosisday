// src/features/public/HallOfStarsPage.jsx
// Página institucional /hall-de-estrelas: palestrantes em destaque
// (starSpeakerIds) e todos os palestrantes vinculados, agregados de TODAS
// as edições publicadas — não só a mais recente, ao contrário de /sobre e
// /edicoes.

import { useMemo } from 'react';
import { useLanguage } from '../../hooks/useLanguage.js';
import { usePublishedEvents } from '../../hooks/useEvents.js';
import { useCollaborators } from '../../hooks/useCollaborators.js';
import { COLLABORATOR_TYPES } from '../../utils/constants.js';
import { resolveCollaboratorsByType, collectUniqueIds } from '../../utils/collaborators.js';
import SimpleHero from '../../components/public/SimpleHero.jsx';
import FeaturedSpeakers from './components/hallofstars/FeaturedSpeakers.jsx';
import AllSpeakers from './components/hallofstars/AllSpeakers.jsx';

export default function HallOfStarsPage() {
  const { t } = useLanguage();
  const { data: publishedEvents = [] } = usePublishedEvents();
  const { data: allCollaborators = [] } = useCollaborators();

  const collaboratorsById = useMemo(
    () => new Map(allCollaborators.map((c) => [c.id, c])),
    [allCollaborators],
  );

  const featuredSpeakers = useMemo(() => {
    const ids = collectUniqueIds(publishedEvents, 'starSpeakerIds');
    return resolveCollaboratorsByType(ids, collaboratorsById, COLLABORATOR_TYPES.SPEAKER);
  }, [publishedEvents, collaboratorsById]);

  const allSpeakers = useMemo(() => {
    const ids = collectUniqueIds(publishedEvents, 'speakers');
    return resolveCollaboratorsByType(ids, collaboratorsById, COLLABORATOR_TYPES.SPEAKER);
  }, [publishedEvents, collaboratorsById]);

  return (
    <>
      <SimpleHero
        title={t.site.hallOfStarsPageHeroTitle}
        subtitle={t.site.hallOfStarsPageHeroSubtitle}
      />

      <FeaturedSpeakers
        title={t.site.hallOfStarsPageFeaturedTitle}
        people={featuredSpeakers}
      />

      <AllSpeakers
        title={t.site.hallOfStarsPageAllTitle}
        searchPlaceholder={t.site.hallOfStarsPageSearchPlaceholder}
        emptyTitle={t.site.hallOfStarsPageEmptyTitle}
        emptyBody={t.site.hallOfStarsPageEmptyBody}
        people={allSpeakers}
      />
    </>
  );
}

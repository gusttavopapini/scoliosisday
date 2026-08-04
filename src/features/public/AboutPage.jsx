// src/features/public/AboutPage.jsx
// Página institucional /sobre: hero fixo + texto/cards + seção Recife +
// organizadores e patrocinadores da edição mais recente publicada.

import { useMemo } from 'react';
import { useLanguage } from '../../hooks/useLanguage.js';
import { usePublishedEvents } from '../../hooks/useEvents.js';
import { useCollaborators } from '../../hooks/useCollaborators.js';
import { useSponsors } from '../../hooks/useSponsors.js';
import { COLLABORATOR_TYPES } from '../../utils/constants.js';
import { resolveCollaboratorsByType } from '../../utils/collaborators.js';
import SimpleHero from '../../components/public/SimpleHero.jsx';
import AboutIntro from './components/about/AboutIntro.jsx';
import AboutRecife from './components/about/AboutRecife.jsx';
import PeopleSection from './components/editions/PeopleSection.jsx';
import EditionSponsors from './components/editions/EditionSponsors.jsx';
import SponsorCta from './components/SponsorCta.jsx';

export default function AboutPage() {
  const { t } = useLanguage();
  // usePublishedEvents entrega mais recentes primeiro — o [0] é a edição
  // mais recentemente publicada, a mesma fonte usada pelas seções 4 e 5.
  const { data: publishedEvents = [] } = usePublishedEvents();
  const { data: allCollaborators = [] } = useCollaborators();
  const { data: allSponsors = [] } = useSponsors();

  const latestEvent = publishedEvents[0] ?? null;

  const collaboratorsById = useMemo(
    () => new Map(allCollaborators.map((c) => [c.id, c])),
    [allCollaborators],
  );
  const sponsorsById = useMemo(
    () => new Map(allSponsors.map((s) => [s.id, s])),
    [allSponsors],
  );

  const organizers = useMemo(() => {
    if (!latestEvent) return [];
    return resolveCollaboratorsByType(latestEvent.organizerIds, collaboratorsById, COLLABORATOR_TYPES.ORGANIZER);
  }, [latestEvent, collaboratorsById]);

  return (
    <>
      <SimpleHero title={t.site.aboutPageHeroTitle} subtitle={t.site.aboutPageHeroSubtitle} />
      <AboutIntro />
      <AboutRecife />

      <PeopleSection title={t.site.organizersTitle} people={organizers} />

      {latestEvent && <EditionSponsors event={latestEvent} sponsorsById={sponsorsById} />}
      <SponsorCta />
    </>
  );
}

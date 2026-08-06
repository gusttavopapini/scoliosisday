// src/features/public/AboutPage.jsx
// Página institucional /sobre: hero fixo + texto/cards + seção Recife,
// patrocinadores da edição mais recente publicada, e duas listas 100%
// globais e automáticas — organizadores (type organizer) e curadoria
// científica (type scientific_curator) — nenhuma das duas depende de
// evento. "Quem faz o Scoliosis Day" só existe aqui: removida de
// /edicoes, que tinha uma seleção por evento (ver histórico em
// EventStep4.jsx/EditionsPage.jsx — curadoria ainda mantém esse modelo
// de duas camadas lá, organizadores não mais).

import { useMemo } from 'react';
import { useLanguage } from '../../hooks/useLanguage.js';
import { usePublishedEvents } from '../../hooks/useEvents.js';
import { useCollaborators } from '../../hooks/useCollaborators.js';
import { useSponsors } from '../../hooks/useSponsors.js';
import { COLLABORATOR_TYPES } from '../../utils/constants.js';
import SimpleHero from '../../components/public/SimpleHero.jsx';
import BrandWordmark from '../../components/BrandWordmark.jsx';
import AboutIntro from './components/about/AboutIntro.jsx';
import AboutRecife from './components/about/AboutRecife.jsx';
import PeopleSection from './components/editions/PeopleSection.jsx';
import EditionSponsors from './components/editions/EditionSponsors.jsx';
import SponsorCta from './components/SponsorCta.jsx';

export default function AboutPage() {
  const { t } = useLanguage();
  // usePublishedEvents entrega mais recentes primeiro — o [0] é a edição
  // mais recentemente publicada, usada só pela seção de patrocinadores.
  const { data: publishedEvents = [] } = usePublishedEvents();
  const { data: allCollaborators = [] } = useCollaborators();
  const { data: allSponsors = [] } = useSponsors();

  const latestEvent = publishedEvents[0] ?? null;

  const sponsorsById = useMemo(
    () => new Map(allSponsors.map((s) => [s.id, s])),
    [allSponsors],
  );

  const organizers = useMemo(
    () => allCollaborators.filter((c) => c.type === COLLABORATOR_TYPES.ORGANIZER),
    [allCollaborators],
  );

  // Curadoria do Sobre: automática, todo colaborador com type
  // scientific_curator — sem seleção adicional e sem relação com qual
  // evento é o atual, diferente da seção equivalente em /edicoes (que
  // segue o evento isCurrent).
  const aboutCurators = useMemo(
    () => allCollaborators.filter((c) => c.type === COLLABORATOR_TYPES.SCIENTIFIC_CURATOR),
    [allCollaborators],
  );

  return (
    <>
      <SimpleHero title={t.site.aboutPageHeroTitle} subtitle={t.site.aboutPageHeroSubtitle} />
      <AboutIntro />
      <AboutRecife />

      <PeopleSection
        title={<>{t.site.organizersTitleMain} <BrandWordmark /></>}
        people={organizers}
        headingClassName="sdp-heading--regular"
      />

      <PeopleSection
        title={t.site.curatorsTitle}
        people={aboutCurators}
        headingClassName="sdp-heading--regular"
      />

      {latestEvent && <EditionSponsors event={latestEvent} sponsorsById={sponsorsById} />}
      <SponsorCta />
    </>
  );
}

// src/features/public/EditionsPage.jsx
// Página de edições: uma aba por evento publicado, na ordem de editionNumber
// (crescente). Trocar de aba troca todo o conteúdo das seções abaixo.
//
// O número da edição é definido pelo admin no passo 1 do wizard — não é
// derivado de createdAt. Eventos anteriores ao campo ficam sem número: vão
// para o fim da lista e a aba mostra o headline no lugar de "Nª Edição".

import { useMemo, useState } from 'react';
import { useLanguage } from '../../hooks/useLanguage.js';
import { usePublishedEvents } from '../../hooks/useEvents.js';
import { useCollaborators } from '../../hooks/useCollaborators.js';
import { useSponsors } from '../../hooks/useSponsors.js';
import { COLLABORATOR_TYPES } from '../../utils/constants.js';
import { ordinal } from '../../utils/ordinal.js';
import { eventBannerUrl } from '../../utils/eventBanner.js';
import { resolveCollaboratorsByType } from '../../utils/collaborators.js';
import EditionHero from './components/editions/EditionHero.jsx';
import PeopleSection from './components/editions/PeopleSection.jsx';
import EditionPricing from './components/editions/EditionPricing.jsx';
import EditionPresentation from './components/editions/EditionPresentation.jsx';
import { hasValidPresentation } from '../../utils/presentationIcons.js';
import EditionSchedule from './components/editions/EditionSchedule.jsx';
import EditionSponsors from './components/editions/EditionSponsors.jsx';
import EditionDebugBar from './components/editions/EditionDebugBar.jsx';
import SponsorCta from './components/SponsorCta.jsx';

export default function EditionsPage() {
  const { t, lang } = useLanguage();
  const { data: publishedEvents = [] } = usePublishedEvents();
  const { data: allCollaborators = [] } = useCollaborators();
  const { data: allSponsors = [] } = useSponsors();

  // Abas em ordem crescente de editionNumber — o número é definido pelo admin
  // no passo 1 do wizard, não derivado de createdAt. Eventos sem número (os
  // anteriores ao campo) vão para o fim, entre si pelo mais recente primeiro,
  // que é a ordem em que usePublishedEvents já os entrega.
  const orderedEvents = useMemo(() => {
    const numbered = publishedEvents
      .filter((event) => typeof event.editionNumber === 'number')
      .sort((a, b) => a.editionNumber - b.editionNumber);
    const unnumbered = publishedEvents.filter(
      (event) => typeof event.editionNumber !== 'number',
    );
    return [...numbered, ...unnumbered];
  }, [publishedEvents]);

  const [activeEventId, setActiveEventId] = useState(null);
  const activeEvent = activeEventId
    ? orderedEvents.find((event) => event.id === activeEventId) ?? orderedEvents[0]
    : orderedEvents[0];

  /** Rótulo da aba/badge: "1ª Edição" quando há número, headline quando não. */
  function editionLabel(event) {
    if (typeof event.editionNumber !== 'number') return event.headline;
    return t.site.editionBadge.replace('{ordinal}', ordinal(event.editionNumber, lang));
  }

  const collaboratorsById = useMemo(
    () => new Map(allCollaborators.map((c) => [c.id, c])),
    [allCollaborators],
  );
  const sponsorsById = useMemo(
    () => new Map(allSponsors.map((s) => [s.id, s])),
    [allSponsors],
  );

  const starCollaborators = useMemo(() => {
    if (!activeEvent) return [];
    return (activeEvent.starSpeakerIds ?? [])
      .map((id) => collaboratorsById.get(id))
      .filter(Boolean);
  }, [activeEvent, collaboratorsById]);

  const organizers = useMemo(() => {
    if (!activeEvent) return [];
    return resolveCollaboratorsByType(activeEvent.organizerIds, collaboratorsById, COLLABORATOR_TYPES.ORGANIZER);
  }, [activeEvent, collaboratorsById]);

  const curators = useMemo(() => {
    if (!activeEvent) return [];
    return resolveCollaboratorsByType(activeEvent.curatorIds, collaboratorsById, COLLABORATOR_TYPES.SCIENTIFIC_CURATOR);
  }, [activeEvent, collaboratorsById]);

  if (!activeEvent) {
    return (
      <section className="sdp-placeholder">
        <h1 className="sd-display sd-display--md">{t.site.editionsEmptyTitle}</h1>
        <p className="sd-lead sd-muted">{t.site.editionsEmptyBody}</p>
      </section>
    );
  }

  const debugFields = [
    { label: 'Banner', filled: Boolean(eventBannerUrl(activeEvent)) },
    { label: 'starSpeakerIds', filled: (activeEvent.starSpeakerIds?.length ?? 0) > 0 },
    { label: 'priceInPerson', filled: typeof activeEvent.priceInPerson === 'number' },
    { label: 'priceOnline', filled: typeof activeEvent.priceOnline === 'number' },
    { label: 'presentation', filled: hasValidPresentation(activeEvent.presentation) },
    { label: 'programming', filled: Boolean(activeEvent.programming) },
    { label: 'sponsors', filled: (activeEvent.sponsors?.length ?? 0) > 0 },
    { label: 'organizerIds', filled: (activeEvent.organizerIds?.length ?? 0) > 0 },
    { label: 'curatorIds', filled: (activeEvent.curatorIds?.length ?? 0) > 0 },
  ];

  return (
    <>
      <EditionDebugBar fields={debugFields} />

      {orderedEvents.length > 1 && (
        <nav className="sdp-edition-tabs" aria-label={t.site.editions}>
          <div className="sd-container sdp-edition-tabs__inner">
            {orderedEvents.map((event) => (
              <button
                key={event.id}
                type="button"
                className={`sdp-edition-tabs__tab${event.id === activeEvent.id ? ' sdp-edition-tabs__tab--active' : ''}`}
                onClick={() => setActiveEventId(event.id)}
                aria-current={event.id === activeEvent.id ? 'true' : undefined}
              >
                {editionLabel(event)}
              </button>
            ))}
          </div>
        </nav>
      )}

      {/* key={activeEvent.id}: seções com estado interno (slide ativo, dia
          ativo) remontam do zero a cada troca de aba, em vez de arrastar o
          índice de uma edição para outra. */}
      <EditionHero
        key={`hero-${activeEvent.id}`}
        event={activeEvent}
        editionBadge={typeof activeEvent.editionNumber === 'number' ? editionLabel(activeEvent) : undefined}
      />

      <PeopleSection title={t.site.starsTitle} people={starCollaborators} showType />

      <EditionPricing key={`pricing-${activeEvent.id}`} event={activeEvent} />

      <EditionPresentation event={activeEvent} />

      <EditionSchedule
        key={`schedule-${activeEvent.id}`}
        event={activeEvent}
        collaboratorsById={collaboratorsById}
      />

      <EditionSponsors event={activeEvent} sponsorsById={sponsorsById} />

      <SponsorCta />

      <PeopleSection title={t.site.organizersTitle} people={organizers} />

      <PeopleSection title={t.site.curatorsTitle} people={curators} />
    </>
  );
}

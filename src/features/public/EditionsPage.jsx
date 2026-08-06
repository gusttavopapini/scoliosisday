// src/features/public/EditionsPage.jsx
// Página de edições: uma aba por evento publicado, na ordem de editionNumber
// (decrescente — a mais recente primeiro). Trocar de aba troca todo o
// conteúdo das seções abaixo.
//
// O número da edição é definido pelo admin no passo 1 do wizard — não é
// derivado de createdAt. Eventos anteriores ao campo ficam sem número: vão
// para o fim da lista e a aba mostra o headline no lugar de "Nª Edição".
//
// isCurrent é um campo por evento (services/events.js: useSetCurrentEvent
// desmarca o anterior no mesmo batch ao marcar um novo) — só um evento tem
// isCurrent:true por vez, e é ele que ganha o destaque laranja na aba,
// independente de qual aba está ativa/selecionada no momento.

import { useMemo, useRef, useState, useEffect } from 'react';
import { ChevronRight } from 'lucide-react';
import { useLanguage } from '../../hooks/useLanguage.js';
import { usePublishedEvents } from '../../hooks/useEvents.js';
import { useCollaborators } from '../../hooks/useCollaborators.js';
import { COLLABORATOR_TYPES } from '../../utils/constants.js';
import { ordinal } from '../../utils/ordinal.js';
import { resolveCollaboratorsByType } from '../../utils/collaborators.js';
import EditionHero from './components/editions/EditionHero.jsx';
import PeopleSection from './components/editions/PeopleSection.jsx';
import EditionPricing from './components/editions/EditionPricing.jsx';
import EditionPresentation from './components/editions/EditionPresentation.jsx';
import EditionSchedule from './components/editions/EditionSchedule.jsx';

export default function EditionsPage() {
  const { t, lang } = useLanguage();
  const { data: publishedEvents = [] } = usePublishedEvents();
  const { data: allCollaborators = [] } = useCollaborators();

  // Abas em ordem decrescente de editionNumber — a edição mais recente
  // (maior número) primeiro. O número é definido pelo admin no passo 1 do
  // wizard, não derivado de createdAt. Eventos sem número (os anteriores ao
  // campo) vão pro fim, entre si pelo mais recente primeiro, que é a ordem
  // em que usePublishedEvents já os entrega.
  const orderedEvents = useMemo(() => {
    const numbered = publishedEvents
      .filter((event) => typeof event.editionNumber === 'number')
      .sort((a, b) => b.editionNumber - a.editionNumber);
    const unnumbered = publishedEvents.filter(
      (event) => typeof event.editionNumber !== 'number',
    );
    return [...numbered, ...unnumbered];
  }, [publishedEvents]);

  const [activeEventId, setActiveEventId] = useState(null);
  const activeEvent = activeEventId
    ? orderedEvents.find((event) => event.id === activeEventId) ?? orderedEvents[0]
    : orderedEvents[0];

  // Fade + seta na borda direita das abas só aparecem quando a lista de
  // fato não cabe na largura disponível (scrollWidth > clientWidth) — com
  // poucas edições, some. Reavalia no resize e sempre que o número de abas
  // muda (mais edições publicadas depois). Também esconde perto do fim do
  // scroll: não faz sentido indicar "mais conteúdo" quando já não há mais
  // à direita.
  const tabsScrollRef = useRef(null);
  const [tabsOverflow, setTabsOverflow] = useState(false);
  const [tabsAtEnd, setTabsAtEnd] = useState(false);

  useEffect(() => {
    const el = tabsScrollRef.current;
    if (!el) return;

    function checkOverflow() {
      setTabsOverflow(el.scrollWidth > el.clientWidth + 1);
      setTabsAtEnd(el.scrollLeft + el.clientWidth >= el.scrollWidth - 1);
    }

    checkOverflow();
    el.addEventListener('scroll', checkOverflow);
    window.addEventListener('resize', checkOverflow);
    return () => {
      el.removeEventListener('scroll', checkOverflow);
      window.removeEventListener('resize', checkOverflow);
    };
  }, [orderedEvents.length]);

  /** Rótulo da aba/badge: "1ª Edição" quando há número, headline quando não. */
  function editionLabel(event) {
    if (typeof event.editionNumber !== 'number') return event.headline;
    return t.site.editionBadge.replace('{ordinal}', ordinal(event.editionNumber, lang));
  }

  const collaboratorsById = useMemo(
    () => new Map(allCollaborators.map((c) => [c.id, c])),
    [allCollaborators],
  );

  const starCollaborators = useMemo(() => {
    if (!activeEvent) return [];
    return (activeEvent.starSpeakerIds ?? [])
      .map((id) => collaboratorsById.get(id))
      .filter(Boolean);
  }, [activeEvent, collaboratorsById]);

  // Curadoria científica: mesma fonte de todo o resto da página
  // (activeEvent, a edição da aba selecionada) — só exibe quando ESSA
  // edição específica é a atual. Uma edição passada pode ter curatorIds
  // salvo (dado histórico preservado), mas a seção some mesmo assim; só
  // reaparece na aba que de fato for isCurrent:true.
  const curators = useMemo(() => {
    if (!activeEvent?.isCurrent) return [];
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

  return (
    <>
      {/* Abas + banner num fundo só (sem "costura" de cor entre os dois),
          com a textura pontilhada com fade (utilitário compartilhado com
          a Home) por cima, dissipando antes da seção seguinte — ver
          .sdp-dotted-fade em public.css. */}
      <div className="sdp-dotted-fade">
        {orderedEvents.length > 1 && (
          <nav className="sdp-edition-tabs" aria-label={t.site.editions}>
            <div className="sd-container sdp-edition-tabs__outer">
              <div
                className={`sdp-edition-tabs__inner${tabsOverflow ? ' sdp-edition-tabs__inner--scroll' : ''}`}
                ref={tabsScrollRef}
              >
                {orderedEvents.map((event) => (
                  <button
                    key={event.id}
                    type="button"
                    className={`sdp-edition-tabs__tab${event.id === activeEvent.id ? ' sdp-edition-tabs__tab--active' : ''}${event.isCurrent ? ' sdp-edition-tabs__tab--current' : ''}`}
                    onClick={() => setActiveEventId(event.id)}
                    aria-current={event.id === activeEvent.id ? 'true' : undefined}
                  >
                    {editionLabel(event)}
                  </button>
                ))}
              </div>

              {/* Só aparece quando as abas de fato não cabem na largura
                  disponível, e some perto do fim do scroll — ver o efeito
                  que calcula tabsOverflow/tabsAtEnd acima. */}
              {tabsOverflow && !tabsAtEnd && (
                <div className="sdp-edition-tabs__fade" aria-hidden="true">
                  <ChevronRight size={18} />
                </div>
              )}
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
      </div>

      <PeopleSection
        title={t.site.starsTitle}
        people={starCollaborators}
        showType
        headingClassName="sdp-heading--regular"
      />

      <EditionPricing key={`pricing-${activeEvent.id}`} event={activeEvent} />

      <EditionPresentation event={activeEvent} />

      <EditionSchedule
        key={`schedule-${activeEvent.id}`}
        event={activeEvent}
        collaboratorsById={collaboratorsById}
      />

      <PeopleSection
        title={t.site.curatorsTitle}
        people={curators}
        headingClassName="sdp-heading--regular"
      />
    </>
  );
}

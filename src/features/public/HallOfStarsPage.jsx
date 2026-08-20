// src/features/public/HallOfStarsPage.jsx
// Página institucional /hall-de-estrelas: UMA grade única com todos os
// palestrantes cadastrados, sem hierarquia entre eles.
//
// A página tinha duas seções — "Hall de Estrelas" (os marcados em
// starSpeakerIds de alguma edição) e "Todos os palestrantes" — e a
// distinção foi eliminada: não há mais destaque nesta página.
//
// A FONTE também mudou, e é o que corrige o sumiço de palestrantes:
// antes a lista era derivada dos EVENTOS publicados (os ids em
// event.speakers, via collectUniqueIds), então um palestrante cadastrado
// e ainda não vinculado a nenhuma edição simplesmente não existia aqui.
// Agora a página lê a coleção `collaborators` direto e mostra todo mundo
// com type 'speaker' — cadastrar passa a bastar para aparecer, que é o
// comportamento esperado de um "Hall de Estrelas" (um acervo de pessoas,
// não o line-up de uma edição).
//
// starSpeakerIds continua existindo e sendo editado no Passo 4 do wizard:
// é o que alimenta "Presenças Confirmadas" na página de cada edição (ver
// EditionsPage.jsx). Só deixou de ter efeito AQUI.
//
// A ordem é a de fetchCollaborators (createdAt desc — mais recentes
// primeiro), a mesma da listagem do painel.

import { useMemo } from 'react';
import { useLanguage } from '../../hooks/useLanguage.js';
import { useCollaborators } from '../../hooks/useCollaborators.js';
import { COLLABORATOR_TYPES } from '../../utils/constants.js';
import { splitOnBrand } from '../../utils/splitLastWord.js';
import BrandWordmark from '../../components/BrandWordmark.jsx';
import SimpleHero from '../../components/public/SimpleHero.jsx';
import AllSpeakers from './components/hallofstars/AllSpeakers.jsx';

export default function HallOfStarsPage() {
  const { t } = useLanguage();
  const { data: allCollaborators = [] } = useCollaborators();

  const speakers = useMemo(
    () => allCollaborators.filter((person) => person.type === COLLABORATOR_TYPES.SPEAKER),
    [allCollaborators],
  );

  // "Scoliosis Day" dentro do subtítulo vira <BrandWordmark /> — mesmo
  // tratamento da marca em qualquer menção do site (--font-accent
  // itálico), pelo mesmo par splitOnBrand + BrandWordmark que
  // HomeTestimonials.jsx e LoginPage.jsx já usam. O trecho é idêntico nos
  // dois idiomas (nome próprio, nunca traduzido), então o split funciona
  // em PT e EN sem ramificação. Se algum dia a frase deixar de conter a
  // marca, splitOnBrand devolve null e o subtítulo cai na string pura.
  const subtitleBrand = splitOnBrand(t.site.hallOfStarsPageHeroSubtitle);

  return (
    <>
      <SimpleHero
        title={t.site.hallOfStarsPageHeroTitle}
        subtitle={
          subtitleBrand ? (
            <>
              {subtitleBrand.before}
              <BrandWordmark />
              {subtitleBrand.after}
            </>
          ) : (
            t.site.hallOfStarsPageHeroSubtitle
          )
        }
      />

      <AllSpeakers
        searchPlaceholder={t.site.hallOfStarsPageSearchPlaceholder}
        emptyTitle={t.site.hallOfStarsPageEmptyTitle}
        emptyBody={t.site.hallOfStarsPageEmptyBody}
        people={speakers}
      />
    </>
  );
}

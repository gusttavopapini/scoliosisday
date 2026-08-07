// src/features/public/PublicSponsorsPage.jsx
// Página institucional /patrocinadores: patrocinadores (type ===
// 'patrocinador') cadastrados na coleção `sponsors` do painel de Marcas,
// sem nenhum filtro por evento — cadastro e exibição vivem só aqui (ver
// useSponsors.js, "lista inteira"). Apoiadores NÃO aparecem mais aqui —
// exclusividade mútua com a esteira da Home (ver HomeSupporters.jsx):
// cada marca mora em um lugar só, conforme a tag.

import { useLanguage } from '../../hooks/useLanguage.js';
import { useSponsors } from '../../hooks/useSponsors.js';
import { SPONSOR_TYPES } from '../../utils/constants.js';
import SimpleHero from '../../components/public/SimpleHero.jsx';
import AllSponsors from './components/sponsors/AllSponsors.jsx';
import SponsorCta from './components/SponsorCta.jsx';

export default function PublicSponsorsPage() {
  const { t } = useLanguage();
  const { data: allSponsors = [] } = useSponsors();

  // Ausente no documento = SPONSOR (fallback seguro, ver constants.js) —
  // mesmo critério de HomeSupporters.jsx, espelhado.
  const sponsors = allSponsors.filter(
    (sponsor) => (sponsor.type ?? SPONSOR_TYPES.SPONSOR) === SPONSOR_TYPES.SPONSOR,
  );

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

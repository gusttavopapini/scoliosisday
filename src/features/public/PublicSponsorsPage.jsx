// src/features/public/PublicSponsorsPage.jsx
// Página institucional /patrocinadores: TODOS os patrocinadores
// cadastrados na coleção, sem nenhum filtro por evento — cadastro e
// exibição vivem só aqui (ver useSponsors.js, "lista inteira").

import { useLanguage } from '../../hooks/useLanguage.js';
import { useSponsors } from '../../hooks/useSponsors.js';
import SimpleHero from '../../components/public/SimpleHero.jsx';
import AllSponsors from './components/sponsors/AllSponsors.jsx';
import SponsorCta from './components/SponsorCta.jsx';

export default function PublicSponsorsPage() {
  const { t } = useLanguage();
  const { data: sponsors = [] } = useSponsors();

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

// src/features/public/components/editions/EditionSponsorsMarquee.jsx
// ÚLTIMA seção da edição ATUAL, depois do bloco de Localização: esteira
// infinita com os logos das marcas de type === 'patrocinador'.
//
// ── NÃO CONFUNDIR COM EditionSponsors.jsx (mesma pasta) ───────────────
//
// Aquele é outro componente, de outra página (AboutPage) e de outro
// modelo de dado: ele lê `event.sponsors`, a lista de patrocinadores
// ESCOLHIDOS POR EVENTO no wizard — seleção que foi removida do painel.
// Este aqui não tem vínculo com o evento: mostra todo mundo que está
// marcado como patrocinador na coleção `sponsors`, igualzinho à esteira
// de Apoiadores da Home mostra todo mundo marcado como apoiador.
//
// Os dois tipos são mutuamente exclusivos (SPONSOR_TYPES em
// utils/constants.js), então nenhuma marca aparece nas duas esteiras.
//
// Quem decide que isto só existe na edição atual é EditionsPage.jsx, que
// só monta este componente no ramo isCurrent — edição passada não tem a
// seção. Sem nenhum patrocinador cadastrado, LogoMarquee não renderiza
// nada, nem o título nem o espaçamento.

import { useLanguage } from '../../../../hooks/useLanguage.js';
import { useSponsors } from '../../../../hooks/useSponsors.js';
import { SPONSOR_TYPES } from '../../../../utils/constants.js';
import LogoMarquee from '../../../../components/LogoMarquee.jsx';

export default function EditionSponsorsMarquee() {
  const { t } = useLanguage();
  const { data: allSponsors = [] } = useSponsors();

  // Ausente no documento = SPONSOR (fallback seguro, ver constants.js):
  // marca cadastrada antes do campo `type` existir conta como
  // patrocinador, que é o valor que ela tinha na prática.
  const sponsors = allSponsors.filter(
    (sponsor) => (sponsor.type ?? SPONSOR_TYPES.SPONSOR) === SPONSOR_TYPES.SPONSOR,
  );

  return <LogoMarquee brands={sponsors} title={t.site.sponsorsTitle} />;
}

// src/features/public/components/HomeSupporters.jsx
// Seção da Home, logo antes de Depoimentos: esteira infinita de logos dos
// patrocinadores com type === 'apoiador' (mesma coleção `sponsors` do painel
// de Patrocinadores — ver SPONSOR_TYPES em utils/constants.js).
//
// Só o FILTRO mora aqui. A esteira em si (repetição, rolagem automática,
// arrasto, inércia, normalização de logo) é de LogoMarquee, compartilhado
// com a esteira de Patrocinadores da edição atual — ver
// components/editions/EditionSponsorsMarquee.jsx. Sem nenhum apoiador,
// LogoMarquee não renderiza nada, nem o título nem o espaçamento.
import { useLanguage } from '../../../hooks/useLanguage.js';
import { useSponsors } from '../../../hooks/useSponsors.js';
import { SPONSOR_TYPES } from '../../../utils/constants.js';
import LogoMarquee from '../../../components/LogoMarquee.jsx';

export default function HomeSupporters() {
  const { t } = useLanguage();
  const { data: allSponsors = [] } = useSponsors();

  // Ausente no documento = SPONSOR (fallback seguro, ver constants.js) —
  // patrocinador antigo nunca vira apoiador sem o staff marcar.
  const supporters = allSponsors.filter(
    (sponsor) => (sponsor.type ?? SPONSOR_TYPES.SPONSOR) === SPONSOR_TYPES.SUPPORTER,
  );

  return <LogoMarquee brands={supporters} title={t.site.supportersTitle} />;
}

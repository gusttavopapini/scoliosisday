// src/features/public/components/HomeSupporters.jsx
// Seção da Home, logo antes de Depoimentos: esteira infinita de logos dos
// patrocinadores com type === 'apoiador' (mesma coleção `sponsors` do painel
// de Patrocinadores — ver SPONSOR_TYPES em utils/constants.js). Sem nenhum
// apoiador, a seção inteira some (mesma convenção de toda seção sem dado).
//
// A lista é repetida N vezes no JSX pra formar um loop CSS contínuo (ver
// .sdp-marquee__track em public.css — o keyframe lê N de
// --sdp-marquee-repeats via calc(), então qualquer N fecha o loop sem
// salto). N cresce quando há poucos apoiadores: com 1 logo só, 5 cópias
// fixas deixavam buraco visual em telas largas (testado até 2560px) — o
// mínimo de itens abaixo garante densidade suficiente pra cobrir qualquer
// largura razoável, sem depender de cálculo de timing (a duração da
// animação continua fixa, só a contagem de repetição muda).
import { useLanguage } from '../../../hooks/useLanguage.js';
import { useSponsors } from '../../../hooks/useSponsors.js';
import { SPONSOR_TYPES } from '../../../utils/constants.js';

const MIN_TRACK_ITEMS = 24;
const MIN_REPEATS = 5;

export default function HomeSupporters() {
  const { t } = useLanguage();
  const { data: allSponsors = [] } = useSponsors();

  // Ausente no documento = SPONSOR (fallback seguro, ver constants.js) —
  // patrocinador antigo nunca vira apoiador sem o staff marcar.
  const supporters = allSponsors.filter(
    (sponsor) => (sponsor.type ?? SPONSOR_TYPES.SPONSOR) === SPONSOR_TYPES.SUPPORTER,
  );

  if (supporters.length === 0) return null;

  const repeats = Math.max(MIN_REPEATS, Math.ceil(MIN_TRACK_ITEMS / supporters.length));
  const track = Array.from({ length: repeats }, () => supporters).flat();

  return (
    <section className="sd-section sd-section--tight sdp-supporters">
      <div className="sd-container">
        <header className="sd-section-header sd-section-header--center sdp-section-header">
          <h2 className="sd-display sd-display--md sd-display--upright sd-display--teal">
            {t.site.supportersTitle}
          </h2>
        </header>
      </div>

      <div className="sdp-marquee">
        <div className="sdp-marquee__track" style={{ '--sdp-marquee-repeats': repeats }}>
          {track.map((sponsor, index) => (
            <a
              key={`${sponsor.id}-${index}`}
              href={sponsor.website}
              target="_blank"
              rel="noopener noreferrer"
              className="sdp-marquee__item"
              // Só a primeira cópia da lista é navegável por teclado/leitor
              // de tela — as repetições seguintes existem só pro loop visual.
              tabIndex={index < supporters.length ? 0 : -1}
              aria-hidden={index < supporters.length ? undefined : true}
            >
              {sponsor.logoUrl ? (
                <img className="sdp-supporters__logo" src={sponsor.logoUrl} alt={sponsor.name} />
              ) : (
                <span className="sd-logo-strip__ph">{sponsor.name}</span>
              )}
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}

// src/components/LogoMarquee.jsx
// Seção de esteira infinita de logos: título + faixa que anda sozinha e
// aceita arrasto do usuário. Compartilhada por dois lugares hoje:
//
//   · HomeSupporters.jsx          → Apoiadores, na Home
//   · EditionSponsorsMarquee.jsx  → Patrocinadores, na edição atual
//
// Este componente não sabe (nem pode saber) QUAIS marcas mostra: quem
// chama já entrega a lista filtrada e o título. É o que permite as duas
// esteiras terem comportamento idêntico sem uma virar cópia da outra —
// exatamente o erro que este projeto já pagou com quatro implementações
// diferentes do mesmo logo (ver SponsorLogo.jsx).
//
// ── DENSIDADE DA ESTEIRA ──────────────────────────────────────────────
//
// A lista real é repetida N vezes para formar o loop. N cresce quando há
// poucas marcas: com 1 logo só, 5 cópias fixas deixavam buraco visual em
// telas largas (testado até 2560px). MIN_TRACK_ITEMS garante densidade
// suficiente para cobrir qualquer largura razoável — é ele que faz a
// esteira funcionar com 1 ou 2 marcas cadastradas.
//
// N também é O TAMANHO DO CICLO: useDraggableMarquee mede a distância
// entre o primeiro item e o primeiro item da segunda cópia para saber
// quanto vale uma volta. Por isso `itemsPerCycle` é o comprimento da
// lista real, não o do track repetido.

import SponsorLogo from './SponsorLogo.jsx';
import { useDraggableMarquee } from '../hooks/useDraggableMarquee.js';

/** Mínimo de itens no track, somadas todas as repetições. */
const MIN_TRACK_ITEMS = 24;

/** Piso de repetições, mesmo quando já há marcas de sobra. */
const MIN_REPEATS = 5;

/** Teto de altura do logo, em px — entra na normalização por área ótica
 *  do SponsorLogo. Igual nas duas esteiras, de propósito: é o que faz a
 *  mesma marca ter o mesmo peso visual na Home e na página da edição. */
const LOGO_MAX_HEIGHT = 68;

/**
 * @param {{
 *   brands: object[],
 *   title: string,
 * }} props
 *   `brands` já vem filtrado por quem chama (por tipo, por evento, o que
 *   for). Lista vazia não renderiza nada — nem a seção, nem o título, nem
 *   o espaçamento vertical.
 */
export default function LogoMarquee({ brands, title }) {
  // Antes de qualquer early return: hook não pode ficar atrás de
  // condicional. Com a lista vazia ele recebe 0 e não faz nada — os refs
  // nem chegam a ser anexados, porque a seção não renderiza.
  const { containerRef, trackRef, isDragging, handlers } = useDraggableMarquee({
    itemsPerCycle: brands.length,
  });

  if (brands.length === 0) return null;

  const repeats = Math.max(MIN_REPEATS, Math.ceil(MIN_TRACK_ITEMS / brands.length));
  const track = Array.from({ length: repeats }, () => brands).flat();

  return (
    <section className="sd-section sd-section--tight sdp-marquee-section">
      <div className="sd-container">
        <header className="sd-section-header sd-section-header--center sdp-section-header">
          <h2 className="sd-display sd-display--md sd-display--upright sd-display--teal sdp-heading--regular">
            {title}
          </h2>
        </header>
      </div>

      <div
        ref={containerRef}
        className={`sdp-marquee${isDragging ? ' sdp-marquee--dragging' : ''}`}
        {...handlers}
      >
        <div ref={trackRef} className="sdp-marquee__track">
          {track.map((brand, index) => (
            <a
              key={`${brand.id}-${index}`}
              href={brand.website}
              target="_blank"
              rel="noopener noreferrer"
              className="sdp-marquee__item"
              // Só a primeira cópia da lista é navegável por teclado/leitor
              // de tela — as repetições seguintes existem só pro loop visual.
              tabIndex={index < brands.length ? 0 : -1}
              aria-hidden={index < brands.length ? undefined : true}
              draggable={false}
            >
              {brand.logoUrl ? (
                <SponsorLogo src={brand.logoUrl} alt={brand.name} maxHeight={LOGO_MAX_HEIGHT} />
              ) : (
                <span className="sd-logo-strip__ph">{brand.name}</span>
              )}
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}

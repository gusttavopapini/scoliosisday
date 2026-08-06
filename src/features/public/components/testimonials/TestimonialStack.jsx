// src/features/public/components/testimonials/TestimonialStack.jsx
// Pilha de cards com efeito de embaralhamento, compartilhada pelos dois
// carrosséis de depoimento da Home (texto e vídeo). Cada ITEM (não cada
// posição da pilha) é um <div> que persiste entre trocas de slide — é
// isso que faz a troca animar de verdade: a classe de profundidade do
// mesmo nó muda (--active → --hidden ao sair, --hidden → --depth-2 →
// --depth-1 → --active ao subir), então a transition do CSS anima a
// rotação/deslocamento/opacidade em vez de só trocar conteúdo
// instantaneamente. Ver comentário de .sdp-quote-stack em public.css.
//
// Quem chama decide o que cada card renderiza via `renderCard`, porque
// texto e vídeo precisam de conteúdo bem diferente (um <blockquote>, um
// player) — este componente só cuida do empilhamento, do autoplay e da
// navegação.

import { useEffect, useRef, useState } from 'react';
import {
  ChevronUp, ChevronDown, ChevronLeft, ChevronRight,
} from 'lucide-react';
import { useLanguage } from '../../../../hooks/useLanguage.js';

// Mesmo intervalo do carrossel de banners da Home (HomeHero.jsx), pra
// manter o ritmo de autoplay consistente entre os carrosséis do site.
const AUTO_SLIDE_MS = 7000;

/** Classe de profundidade a partir da distância circular até o ativo. */
function depthClass(distance) {
  if (distance === 0) return 'sdp-quote-stack__card--active';
  if (distance === 1) return 'sdp-quote-stack__card--depth-1';
  if (distance === 2) return 'sdp-quote-stack__card--depth-2';
  return 'sdp-quote-stack__card--hidden';
}

/**
 * @param {{
 *   items: object[],
 *   index: number,
 *   onPrev: () => void,
 *   onNext: () => void,
 *   renderCard: (item: object, isActive: boolean) => React.ReactNode,
 *   getKey?: (item: object) => string,
 *   ariaLabel: string,
 *   centered?: boolean,
 *   pause?: boolean,
 *   orientation?: 'vertical' | 'horizontal',
 * }} props
 */
export default function TestimonialStack({
  items,
  index,
  onPrev,
  onNext,
  renderCard,
  getKey,
  ariaLabel,
  centered = false,
  pause = false,
  orientation = 'vertical',
}) {
  const { t } = useLanguage();
  const [hovered, setHovered] = useState(false);
  const count = items.length;

  // Ref "mais recente" (mesmo padrão de EventForm.jsx): onNext muda de
  // identidade a cada render do consumidor (fecha sobre o index dele).
  // Sem isso, listar onNext nas deps recriaria o timer a cada render —
  // ele nunca teria tempo de disparar.
  const onNextRef = useRef(onNext);
  useEffect(() => {
    onNextRef.current = onNext;
  });

  useEffect(() => {
    if (hovered || pause || count < 2) return;
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;

    const timer = setInterval(() => {
      onNextRef.current();
    }, AUTO_SLIDE_MS);
    return () => clearInterval(timer);
    // index nas deps: qualquer troca (autoplay OU clique manual) reinicia
    // a contagem, pra interação do usuário não competir com o timer.
  }, [hovered, pause, count, index]);

  if (count === 0) return null;

  return (
    <div
      className={`sdp-quote-stack-wrap${orientation === 'horizontal' ? ' sdp-quote-stack-wrap--horizontal' : ''}`}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onFocus={() => setHovered(true)}
      onBlur={() => setHovered(false)}
    >
      <div
        className={`sdp-quote-stack${centered ? ' sdp-quote-stack--centered' : ''}${orientation === 'horizontal' ? ' sdp-quote-stack--horizontal' : ''}`}
      >
        {items.map((item, itemIndex) => {
          const distance = (itemIndex - index + count) % count;
          const isActive = distance === 0;

          return (
            <div
              key={getKey ? getKey(item) : item.id}
              className={`sdp-quote-stack__card ${depthClass(distance)}`}
              aria-hidden={isActive ? undefined : true}
            >
              {renderCard(item, isActive)}
            </div>
          );
        })}
      </div>

      {count > 1 && (
        <div className="sdp-quote-stack__nav" aria-label={ariaLabel}>
          <button type="button" className="sdp-carousel__btn" onClick={onPrev} aria-label={t.site.testimonialPrev}>
            {orientation === 'horizontal' ? (
              <ChevronLeft size={20} aria-hidden="true" />
            ) : (
              <ChevronUp size={20} aria-hidden="true" />
            )}
          </button>
          <button type="button" className="sdp-carousel__btn" onClick={onNext} aria-label={t.site.testimonialNext}>
            {orientation === 'horizontal' ? (
              <ChevronRight size={20} aria-hidden="true" />
            ) : (
              <ChevronDown size={20} aria-hidden="true" />
            )}
          </button>
        </div>
      )}
    </div>
  );
}

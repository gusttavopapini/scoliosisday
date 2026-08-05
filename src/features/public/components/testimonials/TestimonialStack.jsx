// src/features/public/components/testimonials/TestimonialStack.jsx
// Pilha de cards parcialmente sobrepostos, compartilhada pelos 3 lugares
// que mostram depoimentos: Home (seção 3), /depoimentos texto e vídeo.
// Só o card ativo ocupa o fluxo normal (define a altura do conjunto); os
// de trás são decorativos — sem interação, escondidos de leitores de tela
// e do teclado.
//
// Quem chama decide o que cada card renderiza via `renderCard`, porque
// texto e vídeo precisam de conteúdo bem diferente (um <blockquote>, um
// player) — este componente só cuida do empilhamento, da navegação e da
// troca de índice.

import { ChevronUp, ChevronDown } from 'lucide-react';
import { useLanguage } from '../../../../hooks/useLanguage.js';

const DEPTH_CLASS = ['sdp-quote-stack__card--active', 'sdp-quote-stack__card--depth-1', 'sdp-quote-stack__card--depth-2'];

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
 * }} props
 */
export default function TestimonialStack({ items, index, onPrev, onNext, renderCard, getKey, ariaLabel, centered = false }) {
  const { t } = useLanguage();
  const count = items.length;
  if (count === 0) return null;

  const stackSize = Math.min(3, count);
  const visible = Array.from({ length: stackSize }, (_, depth) => ({
    item: items[(index + depth) % count],
    depth,
  }));

  return (
    <div className="sdp-quote-stack-wrap">
      <div className={`sdp-quote-stack${centered ? ' sdp-quote-stack--centered' : ''}`}>
        {visible.map(({ item, depth }) => (
          <div
            key={getKey ? getKey(item) : item.id}
            className={`sdp-quote-stack__card ${DEPTH_CLASS[depth]}`}
            aria-hidden={depth !== 0}
          >
            {renderCard(item, depth === 0)}
          </div>
        ))}
      </div>

      {count > 1 && (
        <div className="sdp-quote-stack__nav" aria-label={ariaLabel}>
          <button type="button" className="sdp-carousel__btn" onClick={onPrev} aria-label={t.site.testimonialPrev}>
            <ChevronUp size={20} aria-hidden="true" />
          </button>
          <button type="button" className="sdp-carousel__btn" onClick={onNext} aria-label={t.site.testimonialNext}>
            <ChevronDown size={20} aria-hidden="true" />
          </button>
        </div>
      )}
    </div>
  );
}

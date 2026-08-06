// src/features/public/components/testimonials/TestimonialQuoteCard.jsx
// Card de depoimento textual — compartilhado pela Home (seção 3) e por
// /depoimentos (seção 1), os dois alimentados pela mesma coleção
// `testimonials` do Firestore. Um componente só pra esses dois lugares
// não arriscarem divergir de novo (era exatamente esse o bug: a Home
// tinha seu próprio card ligado a uma fonte de dados diferente).

import { useLanguage } from '../../../../hooks/useLanguage.js';
import { formatTestimonialMonth } from '../../../../utils/formatTestimonialMonth.js';
import AvatarInitials from '../../../../components/ui/AvatarInitials.jsx';

/** @param {{ item: { id: string, quote: string, name: string, role: string, date: string|null } }} props */
export default function TestimonialQuoteCard({ item }) {
  const { lang } = useLanguage();
  const dateLabel = formatTestimonialMonth(item.date, lang);

  return (
    <figure className="sd-quote">
      <blockquote>{item.quote}</blockquote>
      <figcaption>
        <AvatarInitials name={item.name} photoUrl={null} id={item.id} className="sdp-avatar sdp-avatar--sm" />
        <span>
          <b>{item.name}</b>
          <small>{[item.role, dateLabel].filter(Boolean).join(' · ')}</small>
        </span>
      </figcaption>
    </figure>
  );
}

// Placeholder pros cards de trás da pilha (ver TestimonialStack.jsx) — sem
// nenhum texto real. Antes, todo card renderizava a citação de verdade o
// tempo todo, ativo ou não; como os de trás ficam parcialmente
// transparentes e espiando por baixo do ativo, durante a troca de slide
// dava pra ver o texto de dois depoimentos diferentes sobrepostos e se
// misturando. Só o card ativo mostra citação de verdade agora.
export function TestimonialQuoteCardGhost() {
  return <div className="sd-quote sdp-quote-ghost" aria-hidden="true" />;
}

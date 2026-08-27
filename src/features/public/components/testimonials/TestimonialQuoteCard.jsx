// src/features/public/components/testimonials/TestimonialQuoteCard.jsx
// Card de depoimento textual — compartilhado pela Home (seção 3) e por
// /depoimentos (seção 1), os dois alimentados pela mesma coleção
// `testimonials` do Firestore. Um componente só pra esses dois lugares
// não arriscarem divergir de novo (era exatamente esse o bug: a Home
// tinha seu próprio card ligado a uma fonte de dados diferente).
//
// Sem avatar: o círculo de iniciais saiu da assinatura a pedido. O
// componente AvatarInitials.jsx continua existindo e em uso em outros
// cinco pontos do projeto (PersonCard, PersonModal, ScheduleSession,
// CollaboratorsTable e CollaboratorCardSelect) — aqui só deixou de ser
// chamado.

import { useLanguage } from '../../../../hooks/useLanguage.js';
import { useStoredTranslation } from '../../../../hooks/useStoredTranslation.js';
import { displayName } from '../../../../utils/honorifics.js';
import { formatTestimonialMonth } from '../../../../utils/formatTestimonialMonth.js';

/** Campos com versão `_en` gravada ao salvar no painel — ver
 *  services/testimonials.js. `name` não entra: nome próprio não se traduz. */
const TRANSLATABLE_FIELDS = ['quote', 'role'];

/** @param {{ item: { id: string, quote: string, name: string, role: string, date: string|null } }} props */
export default function TestimonialQuoteCard({ item }) {
  const { lang } = useLanguage();
  // Leitura SÍNCRONA do `_en` já gravado, sem chamar a API no pageview —
  // era esse o buraco: o card lia item.quote/item.role crus, então em
  // inglês o depoimento e o cargo continuavam em português. Depoimento
  // antigo (sem `_en`) cai no texto em português, como antes.
  const translated = useStoredTranslation(item, TRANSLATABLE_FIELDS);
  const dateLabel = formatTestimonialMonth(item.date, lang);

  return (
    <figure className="sd-quote">
      <blockquote>{translated.quote}</blockquote>
      {/* O <span> continua envolvendo nome e legenda mesmo sem o avatar
          ao lado: .sd-quote figcaption é flex-row (design-system.css),
          então com <b> e <small> soltos os dois virariam colunas lado a
          lado. Com um filho só, o gap de 12px do figcaption não produz
          espaço nenhum (gap só existe ENTRE filhos) e o
          justify-content:center centraliza o bloco — o mesmo alinhamento
          central já adotado no resto do card. */}
      <figcaption>
        <span>
          <b>{displayName(item.name, lang)}</b>
          <small>{[translated.role, dateLabel].filter(Boolean).join(' · ')}</small>
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

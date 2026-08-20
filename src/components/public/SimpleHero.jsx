// src/components/public/SimpleHero.jsx
// Hero institucional compartilhado: fundo --grad-teal + .sd-dots, título e
// subtítulo centralizados, sem depender de nenhum evento. Usado por toda
// página pública que não tem um hero dinâmico próprio — Sobre, Hall de
// Estrelas, Patrocinadores, Depoimentos.

/**
 * `subtitle` aceita ReactNode, não só string: a página do Hall de
 * Estrelas passa um fragmento com <BrandWordmark /> no meio da frase.
 * @param {{ title: string, subtitle?: import('react').ReactNode }} props
 */
export default function SimpleHero({ title, subtitle }) {
  return (
    <section className="sdp-simple-hero sd-dots">
      <div className="sd-container sdp-simple-hero__inner">
        <h1 className="sd-display sd-display--lg sd-display--on-dark">{title}</h1>
        {subtitle && <p className="sd-lead sd-on-dark">{subtitle}</p>}
      </div>
    </section>
  );
}

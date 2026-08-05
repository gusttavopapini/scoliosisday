// src/components/BrandWordmark.jsx
// Tratamento tipográfico único da marca "Scoliosis Day", onde quer que
// apareça como menção isolada (headings, headline de depoimentos, logo
// textual do login): as duas palavras juntas em --font-accent itálico.
// Nome próprio — nunca traduzido, por isso hardcoded (mesma decisão já
// tomada antes em PublicNavbar/PublicFooter, hoje logo de imagem, não
// mais texto — este componente não afeta mais o header/rodapé).
//
// Compartilhado entre as duas camadas (painel e site público); cada uma
// passa sua própria classe de contexto (sda-*/sdp-*) porque
// design-system.css é fixo e as duas extensões vivem em arquivos
// separados — a classe carrega, entre outras coisas, o
// text-transform:none que evita a marca virar caixa alta dentro de um
// heading .sd-display ao redor (ver .sdp-brand-wordmark/.sda-brand-wordmark).

/** @param {{ className?: string }} props */
export default function BrandWordmark({ className = 'sdp-brand-wordmark' }) {
  return <span className={className}>Scoliosis Day</span>;
}

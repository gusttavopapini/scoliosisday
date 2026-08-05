// src/components/public/AccentWord.jsx
// A última palavra de uma headline institucional, em Fraunces itálico
// (--font-accent) em vez do itálico padrão de Barlow Condensed do kit —
// um acento pontual, não uma segunda fonte de corpo. Usado em Home,
// Edições e Sobre, sempre dentro de um <h2 class="sd-display...">.

/** @param {{ children: React.ReactNode }} props */
export default function AccentWord({ children }) {
  return <em className="sdp-accent-word">{children}</em>;
}

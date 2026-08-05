// src/components/public/AcronymSafeText.jsx
// Renderiza um texto preservando siglas (ex: "ABTE") quando o elemento
// pai aplica text-transform:lowercase pra virar caixa de frase (ver
// .sdp-feature-card__title em public.css) — sem isso a sigla também
// seria baixada. Usado nos títulos de card (Home, Edições, Sobre).

import { splitAcronyms } from '../../utils/preserveAcronyms.js';

/** @param {{ text: string }} props */
export default function AcronymSafeText({ text }) {
  return splitAcronyms(text).map((part, i) =>
    part.caps ? <span key={i} className="sdp-keep-caps">{part.text}</span> : part.text,
  );
}

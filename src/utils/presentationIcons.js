// src/utils/presentationIcons.js
// Resolve o nome de ícone gravado em event.presentation[].icon para o
// componente lucide-react correspondente.
//
// Import nomeado, não `import * as Icons` — a lib tem centenas de ícones, e
// um import coringa traria todos eles para o bundle do site público. Esta
// lista espelha PRESENTATION_ICONS (utils/constants.js), o vocabulário
// fechado que o Passo 3 do wizard já usa; um nome fora dela não deveria
// existir num documento gravado pelo painel.

import { Zap, Globe, Users, Star, Rocket, Heart, Lightbulb, Shield, Award, TrendingUp } from 'lucide-react';

const ICON_COMPONENTS = { Zap, Globe, Users, Star, Rocket, Heart, Lightbulb, Shield, Award, TrendingUp };

/**
 * @param {string} name Um dos valores de PRESENTATION_ICONS.
 * @returns {React.ComponentType|null} null quando o nome não é reconhecido.
 */
export function getPresentationIcon(name) {
  return ICON_COMPONENTS[name] ?? null;
}

/**
 * Um card só conta como preenchido com ícone reconhecido, título e
 * descrição — os três exigidos pelo Passo 3 do wizard. Vive aqui (e não em
 * EditionPresentation.jsx) para o componente exportar só o componente: é o
 * mesmo motivo de authContextValue.js/languageContextValue.js existirem
 * separados dos respectivos providers.
 * @param {object[]} cards
 * @returns {boolean}
 */
export function hasValidPresentation(cards) {
  return (
    Array.isArray(cards) &&
    cards.length === 3 &&
    cards.every((card) => getPresentationIcon(card.icon) && card.title?.trim() && card.description?.trim())
  );
}

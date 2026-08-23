// src/utils/pricingCards.js
// Personalização opcional dos dois cards de modalidade da edição atual
// (presencial e online) — o rótulo e a cor da tag, o subtítulo e o rótulo
// do botão. O VALOR de cada modalidade não mora aqui: continua em
// `priceInPerson`/`priceOnline`, chaves de raiz em centavos, como sempre.
//
// Vive em utils/ pelo mesmo motivo de contentBlocks.js e eventArchive.js:
// é a fonte única da regra "este card tem personalização?", usada nas três
// pontas — o schema (eventSchema.js), a escrita no Firestore
// (services/events.js) e a leitura pública (EditionPricing.jsx) — e os
// componentes públicos não importam de features/.
//
// DIFERENÇA IMPORTANTE em relação a textBlock/videoBlock: aqueles são
// all-or-nothing (meio bloco é tratado como ausente). Aqui NÃO. Os quatro
// campos são independentes entre si: cada um que estiver vazio cai no seu
// próprio padrão, sem afetar os outros. Um admin pode trocar só a cor da
// tag e deixar o resto como está. O objeto inteiro só vira null quando os
// quatro estão vazios — aí não há nada que valha a pena gravar.
//
// É essa independência que garante a compatibilidade com o que já está
// publicado: toda edição salva antes deste recurso não tem as chaves
// `inPersonCard`/`onlineCard`, os quatro campos caem no padrão e a página
// renderiza exatamente como renderizava. Nenhum dado histórico é lido,
// migrado ou apagado.

/** '' para campo em branco, inclusive quando só tem espaço. */
const trimmed = (value) => value?.trim() ?? '';

/**
 * Cor de fundo padrão da tag de cada modalidade, usada como fallback
 * quando o admin não escolheu nenhuma.
 *
 * São os mesmos hex que as classes do kit já pintam hoje —
 * `.sd-tag--solid` (--teal-600) no card presencial e
 * `.sd-tag--orange.sd-tag--solid` (--orange-600) no online. Repetidos aqui
 * como literal porque viram DADO: o ColorPicker precisa de um hex real
 * para abrir na cor certa, e `var(--token)` não serve nem de valor de
 * input nem de valor gravável no Firestore (o eventSchema exige
 * /^#[0-9A-F]{6}$/i). Mesma justificativa de
 * features/events/constants/defaultPalette.js, e o mesmo motivo de este
 * arquivo estar na ALLOWLIST de scripts/lint-tokens.mjs.
 *
 * Se algum dia o kit mudar --teal-600/--orange-600, estes dois valores
 * precisam mudar junto — são um espelho manual, não uma referência.
 */
export const PRICING_TAG_FALLBACK_COLORS = {
  inPerson: '#14BAC2',
  online: '#FC975A',
};

/**
 * Card de modalidade pronto para gravar/renderizar, ou null.
 *
 * Cada campo vazio vira `null`, nunca string vazia e nunca undefined — o
 * site testa a presença de cada um para decidir entre o valor do admin e o
 * padrão, e null é o "vazio" que o resto do projeto guarda no Firestore.
 *
 * `tagColor` não tem o formato validado aqui, só normalizado: isso é do
 * schema (eventSchema.js), que roda no formulário e devolve mensagem ao
 * admin. Um hex inválido que escape (dado antigo, escrita manual pelo
 * console) chega ao site e vira só uma cor que o browser ignora — o card
 * continua legível com a classe do kit por baixo.
 *
 * Preserva as demais chaves do objeto (`subtitle_en`, `tagLabel_en`,
 * `ctaLabel_en`, gravadas pela tradução de escrita) pelo mesmo motivo de
 * normalizeTextBlock: o objeto segue servindo ao useStoredTranslation na
 * leitura pública. Um campo esvaziado não deixa tradução velha para trás —
 * translateTextForStorage devolve null para texto vazio, então o `_en`
 * correspondente é sobrescrito com null na mesma escrita.
 *
 * @param {{ tagLabel?: string|null, tagColor?: string|null,
 *   subtitle?: string|null, ctaLabel?: string|null }|null|undefined} card
 * @returns {object|null}
 */
export function normalizePricingCard(card) {
  if (!card) return null;

  const tagLabel = trimmed(card.tagLabel);
  const tagColor = trimmed(card.tagColor);
  const subtitle = trimmed(card.subtitle);
  const ctaLabel = trimmed(card.ctaLabel);

  // Nenhum dos quatro preenchido: não há personalização a guardar.
  if (!tagLabel && !tagColor && !subtitle && !ctaLabel) return null;

  return {
    ...card,
    tagLabel: tagLabel || null,
    tagColor: tagColor || null,
    subtitle: subtitle || null,
    ctaLabel: ctaLabel || null,
  };
}

/** Campos de texto do card que passam pela tradução de escrita. */
export const PRICING_CARD_TRANSLATABLE_FIELDS = ['tagLabel', 'subtitle', 'ctaLabel'];

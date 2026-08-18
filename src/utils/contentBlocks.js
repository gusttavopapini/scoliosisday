// src/utils/contentBlocks.js
// O bloco de texto corrido opcional de uma edição (textBlock: título +
// parágrafo), editável no Passo 3 das edições atuais e no Passo 2 das
// passadas — ver EventStep3.jsx/EventStep5.jsx, que compartilham os mesmos
// campos via TextBlockFields.jsx.
//
// Fonte única da regra de "o bloco está preenchido?", usada nas três
// pontas: o schema (validação all-or-nothing), a escrita no Firestore
// (services/events.js, que grava null em vez de meio bloco) e a página
// pública (que só renderiza o que voltar não-null daqui). Vive em utils/
// pelo mesmo motivo de eventArchive.js e presentationIcons.js: os
// componentes públicos exportam só componentes.
//
// Um bloco só existe inteiro. Meio bloco não passa pelo schema, e o que
// escapar (dado antigo, escrita manual pelo console) é tratado como
// ausente na leitura, em vez de renderizar uma seção pela metade.
//
// Não há aqui um equivalente para o bloco de CARDS: esse papel já é do
// campo `presentation` (Passo 3, EditionPresentation.jsx), e duplicá-lo
// num segundo campo foi descartado.

/**
 * Bloco de texto corrido pronto para gravar/renderizar, ou null.
 *
 * Preserva as demais chaves do bloco (`title_en`/`body_en`, gravadas pela
 * tradução de escrita — ver utils/writeTimeTranslation.js) para o objeto
 * seguir servindo ao useStoredTranslation na leitura pública.
 *
 * @param {{ title?: string, body?: string }|null|undefined} block
 * @returns {object|null}
 */
export function normalizeTextBlock(block) {
  if (!block) return null;

  const title = block.title?.trim() ?? '';
  const body = block.body?.trim() ?? '';
  if (!title || !body) return null;

  return { ...block, title, body };
}

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
//
// O bloco de VÍDEO (videoBlock) segue o mesmo desenho, com uma diferença:
// o subtítulo é opcional MESMO com o bloco preenchido, então ele não entra
// no teste de "bloco completo" — vira null quando vazio, e o site
// simplesmente não renderiza a linha.

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

/** Origens aceitas para o vídeo de uma edição (videoBlock.videoType). */
export const VIDEO_TYPES = { URL: 'url', UPLOAD: 'upload' };

/**
 * Bloco de vídeo pronto para gravar/renderizar, ou null.
 *
 * Regra all-or-nothing entre `title` e `videoUrl` (os dois obrigatórios
 * quando qualquer um dos dois existe), com `subtitle` sempre opcional:
 * ausente/em branco vira `null`, não string vazia — o site testa a
 * presença do subtítulo para decidir se renderiza a linha, e '' e null
 * dariam o mesmo resultado, mas só null é o "vazio" que o Firestore
 * guarda no resto do projeto.
 *
 * `videoType` decide QUAL player o site monta ('url' → <iframe> de embed,
 * 'upload' → <video> nativo). Um bloco salvo antes deste campo existir
 * (só havia o modo URL) não o tem: o fallback é 'url', que reproduz
 * exatamente o comportamento que ele já tinha.
 *
 * `videoStoragePath` só faz sentido no modo upload — é o caminho do
 * arquivo no Storage. No modo URL é forçado a null, não herdado: trocar
 * de upload para URL não pode deixar para trás o caminho do arquivo
 * antigo como dado órfão apontando para algo que já foi apagado.
 *
 * NÃO valida o FORMATO da URL: isso é do schema (eventSchema.js), que
 * roda no formulário e pode devolver mensagem de erro ao admin. Aqui,
 * na leitura, uma URL inválida que tenha escapado (dado antigo, escrita
 * manual pelo console) chega ao player, e é EditionVideo.jsx que decide
 * não renderizar quando não reconhece a plataforma.
 *
 * Preserva as demais chaves do bloco (`title_en`/`subtitle_en`, gravadas
 * pela tradução de escrita) pelo mesmo motivo de normalizeTextBlock.
 *
 * @param {{ title?: string, subtitle?: string|null, videoType?: string,
 *   videoUrl?: string, videoStoragePath?: string|null }|null|undefined} block
 * @returns {object|null}
 */
export function normalizeVideoBlock(block) {
  if (!block) return null;

  const title = block.title?.trim() ?? '';
  const videoUrl = block.videoUrl?.trim() ?? '';
  if (!title || !videoUrl) return null;

  const subtitle = block.subtitle?.trim() ?? '';
  const videoType = block.videoType === VIDEO_TYPES.UPLOAD ? VIDEO_TYPES.UPLOAD : VIDEO_TYPES.URL;
  const storagePath = block.videoStoragePath?.trim() ?? '';

  return {
    ...block,
    title,
    subtitle: subtitle || null,
    videoType,
    videoUrl,
    videoStoragePath: videoType === VIDEO_TYPES.UPLOAD ? storagePath || null : null,
  };
}

// src/utils/translateForStorage.js
// Os dois tradutores de ESCRITA usados pelos serviços do painel. Ambos
// respeitam o contrato de translateTextForStorage: devolvem null em
// qualquer falha, nunca o texto original disfarçado de tradução e nunca a
// mensagem de erro da API — foi exatamente isso que causou o incidente em
// que o aviso de cota da MyMemory virou conteúdo publicado.
//
//   · translatePlainForStorage — texto puro (depoimento, cargo).
//   · translateHtmlForStorage  — HTML do editor rico (currículo).
//
// Os dois aplicam toEnglishHonorifics no resultado: a MyMemory devolve
// "Dra." intacto, e "Dra." não existe em inglês. Como isso roda só na
// geração do campo `_en`, o texto em português nunca é tocado.
//
// ── POR QUE O HTML PRECISA DE TRATAMENTO PRÓPRIO ──────────────────────
//
// O currículo vem do TipTap como HTML (<p>, <strong>, <h2>, <ul>/<li>,
// <a href>). Mandar essa string inteira pra MyMemory devolveria as tags
// escapadas ou embaralhadas — era essa a razão documentada em
// PersonModal.jsx para o currículo nunca ter sido traduzido.
//
// A saída é traduzir só os NÓS DE TEXTO, deixando a árvore intacta: as
// tags, os atributos e os href continuam byte a byte iguais, e só o texto
// visível troca de idioma.

import { translateTextForStorage } from '../services/translationService.js';
import { toEnglishHonorifics } from './honorifics.js';

/** Teto prático por requisição da MyMemory. Acima disso a API passa a
 *  devolver resposta truncada ou erro, então o texto é fatiado antes. */
const MAX_CHUNK_CHARS = 480;

/**
 * Fatia um texto longo em pedaços abaixo do teto da API, preferindo
 * cortar em fim de frase e, se não houver, em espaço — nunca no meio de
 * uma palavra. Texto curto sai como pedaço único, sem custo.
 */
function splitIntoChunks(text) {
  if (text.length <= MAX_CHUNK_CHARS) return [text];

  const chunks = [];
  let rest = text;

  while (rest.length > MAX_CHUNK_CHARS) {
    const window = rest.slice(0, MAX_CHUNK_CHARS);
    // Da melhor pra pior fronteira de corte.
    const sentenceEnd = Math.max(
      window.lastIndexOf('. '),
      window.lastIndexOf('! '),
      window.lastIndexOf('? '),
    );
    const cut = sentenceEnd > 0 ? sentenceEnd + 1 : window.lastIndexOf(' ');
    // Sem espaço nenhum na janela (palavra gigante, URL colada): corta no
    // teto mesmo, para o laço não travar.
    const at = cut > 0 ? cut : MAX_CHUNK_CHARS;
    chunks.push(rest.slice(0, at));
    rest = rest.slice(at);
  }

  if (rest) chunks.push(rest);
  return chunks;
}

/**
 * Traduz um texto de qualquer tamanho, fatiando quando preciso.
 *
 * SEQUENCIAL, não Promise.all: são chamadas à mesma API gratuita cujo
 * estouro de cota já derrubou o site uma vez. Disparar todos os pedaços
 * de um currículo de uma vez é o padrão de acesso que a MyMemory limita.
 *
 * Falha em QUALQUER pedaço aborta tudo e devolve null — meio texto
 * traduzido e meio em português é pior que o texto inteiro em português,
 * porque o fallback de useStoredTranslation deixa de agir.
 *
 * @returns {Promise<string|null>}
 */
async function translateLongText(text) {
  const chunks = splitIntoChunks(text);
  const out = [];

  for (const chunk of chunks) {
    const translated = await translateTextForStorage(chunk);
    if (!translated) return null;
    out.push(translated);
  }

  return out.join('');
}

/**
 * Tradutor de texto puro. Mesma assinatura de translateTextForStorage,
 * para poder ser passado no lugar dele em translateRootFields.
 * @param {string|null|undefined} text
 * @returns {Promise<string|null>}
 */
export async function translatePlainForStorage(text) {
  if (!text?.trim()) return null;
  const translated = await translateLongText(text);
  return translated ? toEnglishHonorifics(translated) : null;
}

/**
 * Tradutor de HTML: percorre os nós de texto, traduz cada um e devolve o
 * mesmo HTML com o texto em inglês.
 *
 * Nós só de espaço em branco (a quebra de linha que o TipTap deixa entre
 * tags) são pulados: não são conteúdo e gastariam chamada de API à toa.
 * O espaço das BORDAS de um nó com texto é preservado à mão, porque a API
 * apara o que recebe e "palavra </strong>seguinte" perderia o espaço.
 *
 * @param {string|null|undefined} html
 * @returns {Promise<string|null>} null se o HTML for vazio, se não houver
 *   texto a traduzir, ou se qualquer nó falhar (all-or-nothing).
 */
export async function translateHtmlForStorage(html) {
  if (!html?.trim()) return null;

  // DOMParser em vez de innerHTML num elemento solto: não executa script
  // nem dispara carregamento de <img> durante a análise.
  const doc = new DOMParser().parseFromString(html, 'text/html');
  const walker = doc.createTreeWalker(doc.body, NodeFilter.SHOW_TEXT);

  const nodes = [];
  for (let node = walker.nextNode(); node; node = walker.nextNode()) {
    if (node.nodeValue.trim()) nodes.push(node);
  }

  if (nodes.length === 0) return null;

  for (const node of nodes) {
    const raw = node.nodeValue;
    const leading = raw.slice(0, raw.length - raw.trimStart().length);
    const trailing = raw.slice(raw.trimEnd().length);

    const translated = await translateLongText(raw.trim());
    if (!translated) return null;

    node.nodeValue = `${leading}${toEnglishHonorifics(translated)}${trailing}`;
  }

  return doc.body.innerHTML;
}

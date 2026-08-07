// src/services/translationService.js
// Tradução automática de conteúdo dinâmico via MyMemory API — gratuita,
// sem chave. Cobre só o texto que o admin digita (headline de evento,
// depoimento…): a UI estática já tem seu par PT/EN em src/i18n/, isso aqui
// nunca deve competir com t.site.*.
//
// Dois fluxos, dois contratos diferentes:
//   · translateText()          — LEITURA (useTranslatedContent, ao vivo no
//     site público). Sempre devolve algo exibível: a tradução, ou o texto
//     original se a API falhar. Cache em sessionStorage (mesma aba, mesmo
//     texto, sem nova chamada a cada re-render/troca de slide).
//   · translateTextForStorage() — ESCRITA (Parte 2: traduzir uma vez ao
//     salvar no painel, gravar campo `_en` no Firestore, site público lê
//     sem chamar a API). Falha aqui devolve null explicitamente — quem
//     chama grava o campo `_en` como null, nunca o texto original
//     disfarçado de tradução, pra dar pra distinguir "ainda não traduziu"
//     de "traduziu e coincidiu" e tentar de novo numa próxima edição.

const CACHE_PREFIX = 'sd_translation_';

// A MyMemory às vezes devolve HTTP 200 com o aviso de cota estourada
// EMPACOTADO dentro do próprio translatedText (não só via responseStatus
// != 200) — ex: "MYMEMORY WARNING: YOU USED ALL AVAILABLE FREE
// TRANSLATIONS FOR TODAY... SEE: MYMEMORY.TRANSLATED.NET/DOC/USAGELIMITS".
// Confiar cegamente nesse campo é o que causou o incidente de produção em
// que o aviso da API substituiu o conteúdo real da página inteira — por
// isso a checagem de padrão suspeito abaixo, além do responseStatus.
const SUSPICIOUS_PATTERNS = [/MYMEMORY WARNING/i, /QUOTA/i, /USAGE ?LIMIT/i, /mymemory\.translated\.net/i];

function looksLikeApiError(text) {
  return SUSPICIOUS_PATTERNS.some((pattern) => pattern.test(text));
}

/**
 * Chama a MyMemory e devolve a tradução só se a resposta passar em todas
 * as checagens de validade — null em qualquer outro caso (erro de rede,
 * status ruim, cota estourada, texto com cara de aviso). Não decide o que
 * fazer com o null: cada fluxo (leitura/escrita) trata do seu jeito.
 * @returns {Promise<string|null>}
 */
async function fetchValidTranslation(text, targetLang) {
  try {
    const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=pt|${targetLang}`;
    const res = await fetch(url);
    const data = await res.json();
    const translated = data?.responseData?.translatedText;

    const isValidTranslation =
      res.ok &&
      Number(data?.responseStatus) === 200 &&
      data?.quotaFinished !== true &&
      typeof translated === 'string' &&
      translated.trim().length > 0 &&
      !looksLikeApiError(translated);

    if (!isValidTranslation) {
      console.warn('[translationService] resposta inválida da MyMemory (provável cota estourada)', {
        responseStatus: data?.responseStatus,
        responseDetails: data?.responseDetails,
      });
      return null;
    }

    return translated;
  } catch (error) {
    console.warn('[translationService] falha ao chamar a MyMemory', error);
    return null;
  }
}

/**
 * Fluxo de LEITURA — usado por useTranslatedContent. Sempre devolve algo
 * pra exibir: a tradução válida, ou o texto original se a API falhar por
 * qualquer motivo (nunca a mensagem de erro/aviso da API).
 */
export async function translateText(text, targetLang) {
  if (!text || targetLang === 'pt') return text;

  const cacheKey = `${CACHE_PREFIX}${targetLang}_${btoa(encodeURIComponent(text)).slice(0, 40)}`;
  const cached = sessionStorage.getItem(cacheKey);
  if (cached) return cached;

  const translated = await fetchValidTranslation(text, targetLang);
  if (!translated) return text;

  sessionStorage.setItem(cacheKey, translated);
  return translated;
}

export async function translateObject(obj, fields, targetLang) {
  if (targetLang === 'pt') return obj;

  const translated = { ...obj };
  await Promise.all(
    fields.map(async (field) => {
      if (obj[field]) translated[field] = await translateText(obj[field], targetLang);
    }),
  );
  return translated;
}

/**
 * Fluxo de ESCRITA (Parte 2) — usado ao salvar conteúdo no painel, uma vez
 * por texto alterado (ver utils/writeTimeTranslation.js pro diff que evita
 * rechamar a API em cada autosave). null em qualquer falha, de propósito:
 * ver o contrato descrito no topo do arquivo.
 * @returns {Promise<string|null>}
 */
export async function translateTextForStorage(text, targetLang = 'en') {
  if (!text?.trim()) return null;
  return fetchValidTranslation(text, targetLang);
}

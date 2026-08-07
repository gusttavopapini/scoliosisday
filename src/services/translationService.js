// src/services/translationService.js
// Tradução automática de conteúdo dinâmico (Firestore) via MyMemory API —
// gratuita, sem chave. Cobre só o texto que o admin digita (headline de
// evento, minibio de colaborador, depoimento…): a UI estática já tem seu
// par PT/EN em src/i18n/, isso aqui nunca deve competir com t.site.*.
//
// Cache em sessionStorage: mesma aba, mesmo texto, mesma tradução — sem
// nova chamada à API a cada re-render ou troca de aba do carrossel.

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

export async function translateText(text, targetLang) {
  if (!text || targetLang === 'pt') return text;

  const cacheKey = `${CACHE_PREFIX}${targetLang}_${btoa(encodeURIComponent(text)).slice(0, 40)}`;
  const cached = sessionStorage.getItem(cacheKey);
  if (cached) return cached;

  try {
    const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=pt|${targetLang}`;
    const res = await fetch(url);
    const data = await res.json();
    const translated = data?.responseData?.translatedText;

    // Nunca usar a resposta sem validar: status HTTP ok, responseStatus da
    // própria MyMemory igual a 200, texto não vazio e sem padrão de
    // aviso/erro conhecido. Qualquer falha aqui cai no mesmo fallback do
    // catch abaixo — texto original, nunca a mensagem de erro da API.
    const isValidTranslation =
      res.ok &&
      Number(data?.responseStatus) === 200 &&
      data?.quotaFinished !== true &&
      typeof translated === 'string' &&
      translated.trim().length > 0 &&
      !looksLikeApiError(translated);

    if (!isValidTranslation) {
      console.warn('[translationService] resposta inválida da MyMemory (provável cota estourada) — usando texto original', {
        responseStatus: data?.responseStatus,
        responseDetails: data?.responseDetails,
      });
      return text;
    }

    sessionStorage.setItem(cacheKey, translated);
    return translated;
  } catch (error) {
    // Falha de rede ou API fora do ar: mantém o texto original em vez de
    // quebrar a página — pior caso é mostrar PT para quem leu em EN.
    console.warn('[translationService] falha ao chamar a MyMemory — usando texto original', error);
    return text;
  }
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

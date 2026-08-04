// src/services/translationService.js
// Tradução automática de conteúdo dinâmico (Firestore) via MyMemory API —
// gratuita, sem chave. Cobre só o texto que o admin digita (headline de
// evento, minibio de colaborador, depoimento…): a UI estática já tem seu
// par PT/EN em src/i18n/, isso aqui nunca deve competir com t.site.*.
//
// Cache em sessionStorage: mesma aba, mesmo texto, mesma tradução — sem
// nova chamada à API a cada re-render ou troca de aba do carrossel.

const CACHE_PREFIX = 'sd_translation_';

export async function translateText(text, targetLang) {
  if (!text || targetLang === 'pt') return text;

  const cacheKey = `${CACHE_PREFIX}${targetLang}_${btoa(encodeURIComponent(text)).slice(0, 40)}`;
  const cached = sessionStorage.getItem(cacheKey);
  if (cached) return cached;

  try {
    const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=pt|${targetLang}`;
    const res = await fetch(url);
    const data = await res.json();
    const translated = data.responseData?.translatedText || text;
    sessionStorage.setItem(cacheKey, translated);
    return translated;
  } catch {
    // Falha de rede ou API fora do ar: mantém o texto original em vez de
    // quebrar a página — pior caso é mostrar PT para quem leu em EN.
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

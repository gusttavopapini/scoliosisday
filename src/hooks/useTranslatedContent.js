// src/hooks/useTranslatedContent.js
// Traduz os campos dinâmicos de um objeto (Firestore) para o idioma ativo.
// Não bloqueia a UI: `translated` começa igual a `content` e é substituído
// quando a tradução chega — quem consome decide o que fazer com
// `isTranslating` (ex.: shimmer sutil por cima do texto atual).

import { useState, useEffect } from 'react';
import { useLanguage } from './useLanguage.js';
import { translateObject } from '../services/translationService.js';

// useLanguage() fala 'pt-BR'/'en' (contrato do LanguageContext); a API do
// MyMemory fala 'pt'/'en' (ISO 639-1). 'pt' é também o valor que
// translateObject usa para pular a chamada de rede.
function toApiLang(lang) {
  return lang === 'pt-BR' ? 'pt' : lang;
}

/**
 * @param {object|null|undefined} content Objeto vindo do Firestore, ou
 *   null/undefined para pular a tradução (ex.: ainda carregando, ou o
 *   conteúdo em exibição é estático/fallback e já tem par PT/EN em i18n/).
 * @param {string[]} fields Campos de `content` a traduzir.
 */
export function useTranslatedContent(content, fields) {
  const { lang } = useLanguage();
  const targetLang = toApiLang(lang);
  const fieldsKey = fields.join(',');

  const [translated, setTranslated] = useState(content);
  const [isTranslating, setIsTranslating] = useState(false);

  useEffect(() => {
    if (!content || targetLang === 'pt') {
      setTranslated(content);
      return;
    }

    // Mostra o texto original assim que `content` troca (ex.: carrossel
    // avança para o próximo depoimento) — sem isto, `translated` ficaria
    // preso na tradução do item anterior até a chamada abaixo resolver.
    setTranslated(content);

    let cancelled = false;
    setIsTranslating(true);

    translateObject(content, fieldsKey.split(','), targetLang)
      .then((result) => {
        if (!cancelled) setTranslated(result);
      })
      .finally(() => {
        if (!cancelled) setIsTranslating(false);
      });

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- fieldsKey é o
    // conteúdo estável de `fields`; a lista em si é recriada a cada render.
  }, [content, targetLang, fieldsKey]);

  return { translated, isTranslating };
}

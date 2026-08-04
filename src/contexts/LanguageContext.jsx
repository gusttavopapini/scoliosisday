// src/contexts/LanguageContext.jsx
// Provider de idioma do site público (PT-BR / EN).
//
// Expõe o dicionário já resolvido em `t`, para que as páginas públicas nunca
// importem pt-BR.js ou en.js direto — quem importa direto é só o painel, que
// não troca de idioma.
//
// A preferência persiste em localStorage; na primeira visita o palpite vem do
// navegador. O acesso ao storage é protegido porque Safari em navegação
// privada lança ao gravar.

import { useState, useEffect, useCallback, useMemo } from 'react';
import ptBR from '../i18n/pt-BR.js';
import en from '../i18n/en.js';
import {
  LanguageContext,
  LANGUAGES,
  DEFAULT_LANGUAGE,
  LANGUAGE_STORAGE_KEY,
} from './languageContextValue.js';

const DICTIONARIES = { 'pt-BR': ptBR, en };

/** Idioma salvo, ou o do navegador, ou o padrão. Nunca lança. */
function readInitialLanguage() {
  try {
    const saved = localStorage.getItem(LANGUAGE_STORAGE_KEY);
    if (saved && LANGUAGES.includes(saved)) return saved;
  } catch {
    // localStorage indisponível — segue para o palpite do navegador.
  }

  // navigator.language vem como 'pt-BR', 'pt', 'en-US'… Só o prefixo importa.
  const browser = typeof navigator === 'undefined' ? '' : navigator.language || '';
  return browser.toLowerCase().startsWith('pt') ? 'pt-BR' : 'en';
}

export function LanguageProvider({ children }) {
  const [lang, setLang] = useState(readInitialLanguage);

  // Mantém o atributo lang do documento em dia: leitores de tela e a correção
  // ortográfica do navegador dependem dele, não do estado do React.
  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  const setLanguage = useCallback((next) => {
    if (!LANGUAGES.includes(next)) return;
    setLang(next);
    try {
      localStorage.setItem(LANGUAGE_STORAGE_KEY, next);
    } catch {
      // Sem persistência: a troca vale só para esta sessão.
    }
  }, []);

  const toggleLanguage = useCallback(() => {
    setLanguage(lang === 'pt-BR' ? 'en' : 'pt-BR');
  }, [lang, setLanguage]);

  const value = useMemo(
    () => ({
      lang,
      // Dicionário já resolvido — é isto que as páginas consomem.
      t: DICTIONARIES[lang] ?? DICTIONARIES[DEFAULT_LANGUAGE],
      languages: LANGUAGES,
      setLanguage,
      toggleLanguage,
    }),
    [lang, setLanguage, toggleLanguage],
  );

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

// src/contexts/languageContextValue.js
// O objeto de contexto vive separado do LanguageProvider para não quebrar o
// Fast Refresh: um módulo que exporta componentes não pode exportar
// também valores comuns. Mesmo arranjo de authContextValue.js.

import { createContext } from 'react';

export const LanguageContext = createContext(null);

/** Idiomas suportados pelo site público. */
export const LANGUAGES = ['pt-BR', 'en'];

/** Idioma usado quando não há preferência salva nem palpite do navegador. */
export const DEFAULT_LANGUAGE = 'pt-BR';

/** Chave da preferência no localStorage. */
export const LANGUAGE_STORAGE_KEY = 'sd:lang';

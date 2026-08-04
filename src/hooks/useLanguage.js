// src/hooks/useLanguage.js
// Hook de conveniência para acessar o LanguageContext.
// Lança erro se usado fora do LanguageProvider — mesmo contrato de useAuth.

import { useContext } from 'react';
import { LanguageContext } from '../contexts/languageContextValue.js';

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage deve ser usado dentro de um LanguageProvider.');
  }
  return context;
}

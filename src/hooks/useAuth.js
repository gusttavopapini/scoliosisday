// src/hooks/useAuth.js
// Hook de conveniência para acessar o AuthContext.
// Lança erro se usado fora do AuthProvider.

import { useContext } from 'react';
import { AuthContext } from '../contexts/authContextValue.js';

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider.');
  }
  return context;
}

// src/contexts/authContextValue.js
// O objeto de contexto vive separado do AuthProvider para não quebrar o
// Fast Refresh: um módulo que exporta componentes não pode exportar
// também valores comuns.

import { createContext } from 'react';

export const AuthContext = createContext(null);

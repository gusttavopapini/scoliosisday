// src/main.jsx
// Ponto de entrada único. Ordem de importação de CSS é obrigatória:
//   1. design-system.css — tokens + componentes sd-* (NÃO EDITAR)
//   2. admin.css         — extensão sda-* do back-office
//   3. public.css        — extensão sdp-* do site público
//   4. global.css        — ajustes mínimos de app

import './styles/design-system.css';
import './styles/admin.css';
import './styles/public.css';
import './styles/global.css';

import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './app/App.jsx';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
);

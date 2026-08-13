// src/main.jsx
// Ponto de entrada único. Ordem de importação de CSS é obrigatória:
//   0. leaflet.css        — CSS do próprio Leaflet (grid de tiles, controles);
//                           antes das nossas camadas pra sda-*/sdp-* poderem
//                           ajustar dimensões do container por cima
//   1. design-system.css — tokens + componentes sd-* (NÃO EDITAR)
//   2. tokens.css         — override global de fonte (--font-display/
//                           accent/text), carrega antes das camadas de
//                           extensão pra elas já herdarem a fonte nova
//   3. admin.css         — extensão sda-* do back-office
//   4. public.css        — extensão sdp-* do site público
//   5. global.css        — ajustes mínimos de app

import 'leaflet/dist/leaflet.css';
import './styles/design-system.css';
import './styles/tokens.css';
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

// src/features/events/constants/mapDefaults.js
// Centro/zoom padrão do LocationPickerModal (Passo 2 do wizard, EventStep2.jsx)
// quando a edição ainda não tem localização salva.

// Recife — sede histórica do evento.
export const DEFAULT_MAP_CENTER = { lat: -8.0476, lng: -34.877 };

// Nível cidade: ponto de partida antes do admin buscar/clicar um local real.
export const DEFAULT_MAP_ZOOM = 13;

// Nível quarteirão: usado depois que um ponto é escolhido (busca, clique ou
// localização já salva), pra já entregar o contexto de vizinhança.
export const PRECISE_MAP_ZOOM = 16;

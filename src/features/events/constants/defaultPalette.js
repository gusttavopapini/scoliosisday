// src/features/events/constants/defaultPalette.js
// Paleta padrão de um evento novo.
//
// Estes hex NÃO são estilo do painel: são dados de conteúdo, gravados no
// documento do evento no Firestore e usados para renderizar a página pública.
// O eventSchema exige /^#[0-9A-F]{6}$/i, então var(--token) não é aceito aqui.
// Por isso este arquivo está na ALLOWLIST de scripts/lint-tokens.mjs.
//
// Os valores espelham os tokens da marca em src/styles/design-system.css:
//   #FFFFFF = --white | #234049 = --gray-800
//   #14BAC2 = --teal-600 | #FC975A = --orange-600

export const DEFAULT_EVENT_COLORS = {
  background: '#FFFFFF',
  text: '#234049',
  button: '#14BAC2',
  detail: '#14BAC2',
  highlight: '#FC975A',
};

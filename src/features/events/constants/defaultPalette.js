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

// Fallback do ColorPicker de cor do botão CTA (EventStep1.jsx e
// BannerForm.jsx) — mesmo par usado por .sd-btn--primary hoje (fundo
// --orange-600, texto branco), pra o círculo mostrar exatamente a cor real
// de um botão sem customização, e pro <input type="color"> nativo (que
// exige hex literal, var() não serve de valor de input) abrir já na cor
// certa.
export const CTA_BUTTON_FALLBACK = {
  bg: '#FC975A',
  text: '#FFFFFF',
};

// Fallback do ColorPicker de cor do separador (EventStep1.jsx) — mesmo hex
// hardcoded hoje em .sd-rule (design-system.css), pra o círculo abrir já na
// cor real de um separador sem customização.
export const SEPARATOR_FALLBACK = '#FC975A';

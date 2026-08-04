// src/utils/programmingDays.js
// Normalização de programações multi-dia, com compatibilidade retroativa.
//
// Documentos novos gravam `days: [{ id, date, label, sessions }]`. Documentos
// criados antes desta mudança só têm `sessions: []` na raiz — normalizeDays
// os trata como um único dia sem quebrar leitura em nenhum lugar do app.

/** Uma sessão vazia, pronta para edição. */
export function newSession() {
  return {
    id: `sess-${Date.now()}-${Math.random().toString(36).slice(2)}`,
    title: '',
    theme: '',
    startTime: '',
    endTime: null,
    speakers: [],
  };
}

/** Um dia vazio, com uma sessão inicial. O rótulo segue a posição (1-based). */
export function newDay(index) {
  return {
    id: `day-${Date.now()}-${Math.random().toString(36).slice(2)}`,
    date: '',
    label: `Dia ${index + 1}`,
    sessions: [newSession()],
  };
}

/**
 * Os dias de uma programação, sempre no formato atual.
 *
 * Documento novo → `days` como veio. Documento legado (só `sessions`) → um
 * dia único sintético, rótulo "Dia 1", sem data. Documento vazio/novo em
 * branco → um dia com uma sessão vazia, para o formulário ter algo a mostrar.
 *
 * @param {{ days?: object[], sessions?: object[] }} [programming]
 * @returns {object[]}
 */
export function normalizeDays(programming) {
  if (programming?.days?.length) return programming.days;
  if (programming?.sessions?.length) {
    return [{ id: 'day-legacy', date: '', label: 'Dia 1', sessions: programming.sessions }];
  }
  return [newDay(0)];
}

/**
 * Todas as sessões de todos os dias, achatadas em uma lista só — para
 * contagens e para integridade referencial, que não precisam da estrutura
 * por dia. Cada sessão sai com `dayLabel` anexado, para identificar de onde
 * veio.
 *
 * @param {{ days?: object[], sessions?: object[] }} [programming]
 * @returns {object[]}
 */
export function flattenSessions(programming) {
  return normalizeDays(programming).flatMap((day) =>
    (day.sessions ?? []).map((session) => ({ ...session, dayLabel: day.label })),
  );
}

/** Meses abreviados por idioma — evita a formatação por extenso do
 * Intl.DateTimeFormat ("12 de set.") na aba do dia, que é compacta. */
const SHORT_MONTHS = {
  'pt-BR': ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'],
  en: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
};

/**
 * "2026-09-12" → "12 Set" (ou "12 Sep" em inglês). Parseia os componentes na
 * mão, e não via `new Date(string)`, porque uma data 'YYYY-MM-DD' é
 * interpretada como meia-noite UTC — em fusos negativos isso pode exibir o
 * dia anterior ao gravado.
 *
 * @param {string} dateStr Formato 'YYYY-MM-DD', como sai do date picker.
 * @param {'pt-BR'|'en'} lang
 * @returns {string|null} null quando a data está vazia ou é inválida.
 */
export function formatDayShort(dateStr, lang = 'pt-BR') {
  if (!dateStr) return null;
  const [year, month, day] = dateStr.split('-').map(Number);
  if (!year || !month || !day) return null;

  const months = SHORT_MONTHS[lang] ?? SHORT_MONTHS['pt-BR'];
  return `${String(day).padStart(2, '0')} ${months[month - 1]}`;
}

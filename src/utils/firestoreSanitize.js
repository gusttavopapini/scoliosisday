// src/utils/firestoreSanitize.js
// Firestore rejeita a escrita inteira se qualquer campo, em qualquer
// profundidade, for `undefined` ("Unsupported field value: undefined") —
// vira null, nunca é omitido (payloads gravados com merge:true precisam
// conseguir LIMPAR um campo que o formulário deixou vazio, não só deixá-lo
// de fora).
//
// Compartilhado entre services/events.js e services/banners.js: os dois
// escrevem payloads de formulário com a mesma forma de risco (arrays de
// objeto, objetos aninhados — presentation, archiveStats, gallery, colors,
// e agora ctaButtonBg/ctaButtonText).

/**
 * true só para `{}` literais — nunca para Date, Timestamp do Firestore ou
 * qualquer outra instância de classe. deepNullifyUndefined precisa dessa
 * distinção pra não "achatar" um Timestamp (que tem métodos no protótipo,
 * não sobrevive a um Object.fromEntries(Object.entries(...))) numa cópia
 * rasa sem os métodos, o que quebraria createdAt/updatedAt reaproveitados
 * de um documento já existente.
 */
export function isPlainObject(value) {
  return value !== null && typeof value === 'object' && value.constructor === Object;
}

/**
 * Converte todo `undefined` em `null`, recursivamente, em arrays e objetos
 * literais — sem tocar em instâncias de classe (Date, Timestamp).
 */
export function deepNullifyUndefined(value) {
  if (value === undefined) return null;
  if (Array.isArray(value)) return value.map(deepNullifyUndefined);
  if (isPlainObject(value)) {
    return Object.fromEntries(
      Object.entries(value).map(([key, v]) => [key, deepNullifyUndefined(v)]),
    );
  }
  return value;
}

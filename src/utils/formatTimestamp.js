// src/utils/formatTimestamp.js
// Converte Firestore Timestamp para Date.

export function toDate(value) {
  if (!value) return null;
  if (value instanceof Date) return value;
  if (value && typeof value.toDate === 'function') {
    return value.toDate();
  }
  return new Date(value);
}

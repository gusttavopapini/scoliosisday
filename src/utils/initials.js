// src/utils/initials.js
// Gera as iniciais de um nome completo.
// "Ana Lima" → "AL" | "Dr. Carlos Mendes" → "CM" | "P" → "P"

/**
 * Extrai até 2 iniciais de um nome completo.
 * Ignora prefixos de título (Dr., Dra., Prof., etc.).
 * @param {string} name
 * @returns {string}
 */
export function getInitials(name) {
  if (!name || typeof name !== 'string') return '?';

  const TITLE_PREFIXES = /^(dr\.?|dra\.?|prof\.?|profa\.?|sr\.?|sra\.?|mr\.?|ms\.?|mrs\.?)\s+/i;

  const cleaned = name.trim().replace(TITLE_PREFIXES, '');
  const parts = cleaned.split(/\s+/).filter(Boolean);

  if (parts.length === 0) return '?';
  if (parts.length === 1) return parts[0][0].toUpperCase();

  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

/**
 * Gera um índice de cor determinístico baseado no id do colaborador.
 * @param {string} id
 * @param {number} paletteSize
 * @returns {number}
 */
export function avatarColorIndex(id, paletteSize = 8) {
  if (!id) return 0;
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = id.charCodeAt(i) + ((hash << 5) - hash);
  }
  return Math.abs(hash) % paletteSize;
}

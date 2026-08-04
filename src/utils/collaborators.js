// src/utils/collaborators.js
// Resolve colaboradores de um evento a partir de um array de ids, na ordem
// em que o evento os lista. Ids sem colaborador correspondente (dado órfão)
// e colaboradores cujo tipo não bate mais com a seção são ignorados — mais
// provável de um tipo ter sido editado depois do vínculo do que de a lista
// precisar mostrar um dado inconsistente.

/**
 * @param {string[]|undefined} ids
 * @param {Map<string, object>} collaboratorsById
 * @param {string} type
 * @returns {object[]}
 */
export function resolveCollaboratorsByType(ids, collaboratorsById, type) {
  return (ids ?? [])
    .map((id) => collaboratorsById.get(id))
    .filter((person) => person && person.type === type);
}

/**
 * IDs únicos de um campo-array (ex.: starSpeakerIds, speakers, sponsors),
 * juntando todos os eventos publicados — usado pelas páginas que agregam
 * gente/patrocinadores de todas as edições, não só a mais recente (Hall de
 * Estrelas, Patrocinadores). A ordem é a de primeira aparição, evento mais
 * recente primeiro (usePublishedEvents já entrega os eventos nessa ordem).
 *
 * @param {object[]} events
 * @param {string} fieldName
 * @returns {string[]}
 */
export function collectUniqueIds(events, fieldName) {
  const ids = new Set();
  for (const event of events) {
    for (const id of event[fieldName] ?? []) ids.add(id);
  }
  return [...ids];
}

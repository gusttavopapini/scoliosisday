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

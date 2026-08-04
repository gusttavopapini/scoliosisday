// src/services/integrity.js
// Integridade referencial entre eventos, colaboradores, patrocinadores
// e programações.
//
// Duas estratégias, conforme o dano de uma referência órfã:
//   BLOQUEIO  — colaborador em uso: apagar corromperia o line-up.
//   CASCATA   — patrocinador e programação: a referência é removida
//               dos eventos afetados e o resto do documento sobrevive.
//
// Nomes reais dos campos no Firestore (não confundir com a spec):
//   events.speakers        — ids de colaboradores no line-up
//   events.starSpeakerIds  — subconjunto em destaque
//   events.sponsors        — ids de patrocinadores
//   events.programming     — id da programação vinculada (ou null)
//   programmings.days[].sessions[].speakers — ids de colaboradores por sessão
//   programmings.speakerIds                 — os mesmos ids achatados na raiz
//   Documentos anteriores à divisão em dias só têm sessions[] na raiz;
//   flattenSessions (utils/programmingDays.js) trata os dois formatos.
//
// Todas as buscas daqui são consultas com where. Antes, cada checagem varria
// events e programmings inteiras e filtrava no cliente.
//
// A raiz `speakerIds` existe porque array-contains não enxerga dentro de um
// array de mapas: `sessions[].speakers` é inalcançável por query. O campo é
// derivado das sessões a cada gravação (services/programmings.js) e os
// documentos anteriores precisam do backfill —
// scripts/backfill-programming-speaker-ids.mjs.

import {
  collection,
  query,
  where,
  getDocs,
  writeBatch,
  doc,
} from 'firebase/firestore';
import { db } from '../config/firebase.js';
import { flattenSessions } from '../utils/programmingDays.js';

const EVENTS_COLLECTION = 'events';
const PROGRAMMINGS_COLLECTION = 'programmings';

/** Firestore limita um writeBatch a 500 operações. */
const BATCH_LIMIT = 500;

// id por último: ver a nota em services/events.js.
const mapDocs = (snapshot) => snapshot.docs.map((snap) => ({ ...snap.data(), id: snap.id }));

/**
 * Aplica as escritas em lotes de até 500 operações.
 * @param {{ ref: import('firebase/firestore').DocumentReference, data: object }[]} writes
 */
async function commitInBatches(writes) {
  for (let i = 0; i < writes.length; i += BATCH_LIMIT) {
    const batch = writeBatch(db);
    for (const { ref, data } of writes.slice(i, i + BATCH_LIMIT)) {
      batch.update(ref, data);
    }
    await batch.commit();
  }
}

/** Eventos em que o campo de array informado contém o id. */
async function eventsWhereArrayContains(field, value) {
  const q = query(collection(db, EVENTS_COLLECTION), where(field, 'array-contains', value));
  return mapDocs(await getDocs(q));
}

// ── Colaboradores: BLOQUEIO ──

/**
 * Onde um colaborador está referenciado.
 *
 * Cobre também events.speakers (line-up sem destaque), não só
 * starSpeakerIds: apagar alguém que consta no line-up deixaria o
 * evento apontando para um documento inexistente.
 *
 * São duas consultas a events porque o Firestore aceita um único
 * array-contains por consulta — os resultados são unidos por id.
 *
 * @param {string} collaboratorId
 * @returns {Promise<{ events: object[], sessions: object[], total: number }>}
 */
export async function findCollaboratorUsages(collaboratorId) {
  const [lineup, stars, programmingsSnap] = await Promise.all([
    eventsWhereArrayContains('speakers', collaboratorId),
    eventsWhereArrayContains('starSpeakerIds', collaboratorId),
    getDocs(
      query(
        collection(db, PROGRAMMINGS_COLLECTION),
        where('speakerIds', 'array-contains', collaboratorId),
      ),
    ),
  ]);

  const starIds = new Set(stars.map((event) => event.id));
  const byId = new Map();
  for (const event of [...lineup, ...stars]) {
    byId.set(event.id, {
      id: event.id,
      headline: event.headline || '(sem título)',
      isStar: starIds.has(event.id),
    });
  }
  const eventUsages = [...byId.values()];

  // A consulta já garante que a programação usa o colaborador; o laço só
  // localiza em quais sessões, para nomeá-las no aviso.
  const sessionUsages = [];
  for (const programming of mapDocs(programmingsSnap)) {
    for (const session of flattenSessions(programming)) {
      if ((session.speakers ?? []).includes(collaboratorId)) {
        sessionUsages.push({
          programmingId: programming.id,
          programmingName: programming.name || '(sem nome)',
          sessionTitle: session.title || '(sessão sem título)',
          dayLabel: session.dayLabel,
        });
      }
    }
  }

  return {
    events: eventUsages,
    sessions: sessionUsages,
    total: eventUsages.length + sessionUsages.length,
  };
}

// ── Patrocinadores: CASCATA ──

/**
 * Remove o patrocinador de events.sponsors em todos os eventos.
 * @returns {Promise<number>} quantidade de eventos alterados
 */
export async function removeSponsorFromEvents(sponsorId) {
  const events = await eventsWhereArrayContains('sponsors', sponsorId);

  const writes = events.map((event) => ({
    ref: doc(db, EVENTS_COLLECTION, event.id),
    data: {
      sponsors: (event.sponsors ?? []).filter((id) => id !== sponsorId),
      updatedAt: new Date(),
    },
  }));

  await commitInBatches(writes);
  return writes.length;
}

// ── Programações: CASCATA com aviso prévio ──

/**
 * Eventos que apontam para esta programação — consultado antes de excluir,
 * para o aviso de impacto.
 * @returns {Promise<{ id: string, headline: string }[]>}
 */
export async function findEventsByProgramming(programmingId) {
  const q = query(
    collection(db, EVENTS_COLLECTION),
    where('programming', '==', programmingId),
  );
  return mapDocs(await getDocs(q)).map((event) => ({
    id: event.id,
    headline: event.headline || '(sem título)',
  }));
}

/**
 * Zera events.programming nos eventos vinculados.
 * @returns {Promise<number>} quantidade de eventos alterados
 */
export async function clearProgrammingFromEvents(programmingId) {
  const affected = await findEventsByProgramming(programmingId);

  const writes = affected.map((event) => ({
    ref: doc(db, EVENTS_COLLECTION, event.id),
    data: { programming: null, updatedAt: new Date() },
  }));

  await commitInBatches(writes);
  return writes.length;
}

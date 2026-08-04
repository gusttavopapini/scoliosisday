// src/services/programmings.js
// Serviço de programações: CRUD no Firestore.

import {
  collection,
  query,
  orderBy,
  limit,
  startAfter,
  getDocs,
  getDoc,
  getCountFromServer,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
} from 'firebase/firestore';
import { db } from '../config/firebase.js';
import { flattenSessions, normalizeDays } from '../utils/programmingDays.js';

const PROGRAMMINGS_COLLECTION = 'programmings';

/** Tamanho de página das listagens. */
export const PROGRAMMINGS_PAGE_SIZE = 20;

// id por último: ver a nota em services/events.js.
const mapDocs = (snapshot) => snapshot.docs.map((snap) => ({ ...snap.data(), id: snap.id }));

/**
 * Achata os palestrantes de todos os dias/sessões em um array na raiz.
 *
 * array-contains não enxerga dentro de `days[].sessions[].speakers` — array
 * de mapas não é indexável por query. Sem este campo, descobrir se um
 * colaborador está em uso exigiria varrer a coleção inteira
 * (services/integrity.js).
 *
 * @param {Array<object>} days
 * @returns {string[]} ids únicos
 */
function collectSpeakerIds(days) {
  return [...new Set(flattenSessions({ days }).flatMap((session) => session.speakers ?? []))];
}

/**
 * Todas as programações, ordenadas. Usado pelo seletor do wizard de eventos.
 * A tela de listagem usa fetchProgrammingsPage.
 */
export async function fetchProgrammings() {
  const q = query(collection(db, PROGRAMMINGS_COLLECTION), orderBy('createdAt', 'desc'));
  return mapDocs(await getDocs(q));
}

/**
 * Uma página de programações.
 * @param {{ pageSize?: number, cursor?: import('firebase/firestore').QueryDocumentSnapshot|null }} [options]
 * @returns {Promise<{ items: object[], nextCursor: object|null }>}
 */
export async function fetchProgrammingsPage({
  pageSize = PROGRAMMINGS_PAGE_SIZE,
  cursor = null,
} = {}) {
  const constraints = [orderBy('createdAt', 'desc')];
  if (cursor) constraints.push(startAfter(cursor));
  constraints.push(limit(pageSize));

  const snapshot = await getDocs(query(collection(db, PROGRAMMINGS_COLLECTION), ...constraints));
  return {
    items: mapDocs(snapshot),
    nextCursor: snapshot.docs.length === pageSize ? snapshot.docs[snapshot.docs.length - 1] : null,
  };
}

/** Total de programações, sem trazer os documentos. */
export async function countProgrammings() {
  const snapshot = await getCountFromServer(collection(db, PROGRAMMINGS_COLLECTION));
  return snapshot.data().count;
}

export async function fetchProgrammingById(id) {
  const docRef = doc(db, PROGRAMMINGS_COLLECTION, id);
  const snapshot = await getDoc(docRef);
  if (!snapshot.exists()) return null;
  // id por último: ver a nota em services/events.js.
  return {
    ...snapshot.data(),
    id: snapshot.id,
  };
}

export async function createProgramming(data) {
  const collectionRef = collection(db, PROGRAMMINGS_COLLECTION);
  const docRef = await addDoc(collectionRef, {
    ...data,
    speakerIds: collectSpeakerIds(data.days),
    createdAt: new Date(),
  });
  return docRef.id;
}

export async function updateProgramming(id, data) {
  const docRef = doc(db, PROGRAMMINGS_COLLECTION, id);
  await updateDoc(docRef, {
    ...data,
    // Só recalcula quando os dias vieram na atualização; um update
    // parcial de outro campo não deve zerar o índice.
    ...(data.days ? { speakerIds: collectSpeakerIds(data.days) } : {}),
    updatedAt: new Date(),
  });
}

export async function deleteProgramming(id) {
  const docRef = doc(db, PROGRAMMINGS_COLLECTION, id);
  await deleteDoc(docRef);
}

export async function duplicateProgramming(id) {
  const original = await fetchProgrammingById(id);
  if (!original) return null;

  // normalizeDays migra documentos legados (só `sessions`) para o formato
  // atual: a cópia sempre nasce em `days`, mesmo quando o original não tinha.
  const newDays = normalizeDays(original).map((day) => ({
    ...day,
    id: `day-${Date.now()}-${Math.random()}`,
    sessions: day.sessions.map((session) => ({
      ...session,
      id: `sess-${Date.now()}-${Math.random()}`,
    })),
  }));

  const docRef = await addDoc(collection(db, PROGRAMMINGS_COLLECTION), {
    name: `${original.name} (cópia)`,
    eventId: null,
    days: newDays,
    speakerIds: collectSpeakerIds(newDays),
    createdAt: new Date(),
  });

  return docRef.id;
}

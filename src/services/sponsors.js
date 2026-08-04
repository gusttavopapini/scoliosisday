// src/services/sponsors.js
// Serviço de patrocinadores: CRUD no Firestore.

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
  setDoc,
  updateDoc,
  deleteDoc,
  doc,
} from 'firebase/firestore';
import { db } from '../config/firebase.js';

const SPONSORS_COLLECTION = 'sponsors';

/** Tamanho de página das listagens. */
export const SPONSORS_PAGE_SIZE = 20;

// id por último: ver a nota em services/events.js.
const mapDocs = (snapshot) => snapshot.docs.map((snap) => ({ ...snap.data(), id: snap.id }));

/**
 * Todos os patrocinadores, ordenados. Usado pelo seletor do wizard de eventos.
 * A tela de listagem usa fetchSponsorsPage.
 */
export async function fetchSponsors() {
  const q = query(collection(db, SPONSORS_COLLECTION), orderBy('createdAt', 'desc'));
  return mapDocs(await getDocs(q));
}

/**
 * Uma página de patrocinadores.
 * @param {{ pageSize?: number, cursor?: import('firebase/firestore').QueryDocumentSnapshot|null }} [options]
 * @returns {Promise<{ items: object[], nextCursor: object|null }>}
 */
export async function fetchSponsorsPage({ pageSize = SPONSORS_PAGE_SIZE, cursor = null } = {}) {
  const constraints = [orderBy('createdAt', 'desc')];
  if (cursor) constraints.push(startAfter(cursor));
  constraints.push(limit(pageSize));

  const snapshot = await getDocs(query(collection(db, SPONSORS_COLLECTION), ...constraints));
  return {
    items: mapDocs(snapshot),
    nextCursor: snapshot.docs.length === pageSize ? snapshot.docs[snapshot.docs.length - 1] : null,
  };
}

/** Total de patrocinadores, sem trazer os documentos. */
export async function countSponsors() {
  const snapshot = await getCountFromServer(collection(db, SPONSORS_COLLECTION));
  return snapshot.data().count;
}

export async function fetchSponsorById(id) {
  const docRef = doc(db, SPONSORS_COLLECTION, id);
  const snapshot = await getDoc(docRef);
  if (!snapshot.exists()) return null;
  // id por último: ver a nota em services/events.js.
  return {
    ...snapshot.data(),
    id: snapshot.id,
  };
}

/**
 * Gera um ID de documento no cliente, sem gravar nada ainda.
 *
 * O upload da logo precisa do ID para montar o caminho no Storage
 * (sponsors/{id}/logo), e ele acontece antes de o formulário ser salvo.
 * Mesmo padrão de newEventId em services/events.js.
 */
export function newSponsorId() {
  return doc(collection(db, SPONSORS_COLLECTION)).id;
}

/**
 * Cria um patrocinador. Com `explicitId`, grava naquele ID (o mesmo já usado
 * no caminho da logo); sem ele, deixa o Firestore sortear.
 * @param {Object} data
 * @param {string} [explicitId]
 * @returns {Promise<string>} ID do novo documento
 */
export async function createSponsor(data, explicitId) {
  const payload = { ...data, createdAt: new Date() };

  if (explicitId) {
    await setDoc(doc(db, SPONSORS_COLLECTION, explicitId), payload);
    return explicitId;
  }

  const docRef = await addDoc(collection(db, SPONSORS_COLLECTION), payload);
  return docRef.id;
}

export async function updateSponsor(id, data) {
  const docRef = doc(db, SPONSORS_COLLECTION, id);
  await updateDoc(docRef, {
    ...data,
    updatedAt: new Date(),
  });
}

export async function deleteSponsor(id) {
  const docRef = doc(db, SPONSORS_COLLECTION, id);
  await deleteDoc(docRef);
}

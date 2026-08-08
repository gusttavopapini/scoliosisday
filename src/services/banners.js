// src/services/banners.js
// Serviço de banners: CRUD no Firestore.

import {
  collection,
  query,
  orderBy,
  limit,
  startAfter,
  getDocs,
  getDoc,
  addDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  doc,
} from 'firebase/firestore';
import { db } from '../config/firebase.js';
import { translateRootFields } from '../utils/writeTimeTranslation.js';
import { deepNullifyUndefined } from '../utils/firestoreSanitize.js';

const BANNERS_COLLECTION = 'banners';

// Mesmos campos traduzíveis do evento (ver services/events.js) — o hero da
// Home combina banner e evento atual no mesmo carrossel/template.
const BANNER_TRANSLATABLE_FIELDS = ['headline', 'subtitle', 'cta'];

/** Tamanho de página das listagens. */
export const BANNERS_PAGE_SIZE = 20;

// id por último: ver a nota em services/events.js.
const mapDocs = (snapshot) => snapshot.docs.map((snap) => ({ ...snap.data(), id: snap.id }));

/**
 * Todos os banners, ordenados pela posição no carrossel.
 * Usado tanto pelo carrossel da Home (filtrando active no cliente) quanto
 * pelo formulário do painel (para calcular o total de banners ativos).
 */
export async function fetchBanners() {
  const q = query(collection(db, BANNERS_COLLECTION), orderBy('order', 'asc'));
  return mapDocs(await getDocs(q));
}

/**
 * Uma página de banners.
 * @param {{ pageSize?: number, cursor?: import('firebase/firestore').QueryDocumentSnapshot|null }} [options]
 * @returns {Promise<{ items: object[], nextCursor: object|null }>}
 */
export async function fetchBannersPage({ pageSize = BANNERS_PAGE_SIZE, cursor = null } = {}) {
  const constraints = [orderBy('order', 'asc')];
  if (cursor) constraints.push(startAfter(cursor));
  constraints.push(limit(pageSize));

  const snapshot = await getDocs(query(collection(db, BANNERS_COLLECTION), ...constraints));
  return {
    items: mapDocs(snapshot),
    nextCursor: snapshot.docs.length === pageSize ? snapshot.docs[snapshot.docs.length - 1] : null,
  };
}

export async function fetchBannerById(id) {
  const docRef = doc(db, BANNERS_COLLECTION, id);
  const snapshot = await getDoc(docRef);
  if (!snapshot.exists()) return null;
  return { ...snapshot.data(), id: snapshot.id };
}

/**
 * Gera um ID de documento no cliente, sem gravar nada ainda.
 * O upload das artes precisa do ID para montar o caminho no Storage
 * (banners/{id}/...), e ele acontece antes de o formulário ser salvo.
 */
export function newBannerId() {
  return doc(collection(db, BANNERS_COLLECTION)).id;
}

/**
 * Cria um banner. Com `explicitId`, grava naquele ID (o mesmo já usado
 * no caminho das artes); sem ele, deixa o Firestore sortear.
 * @param {Object} data
 * @param {string} [explicitId]
 * @returns {Promise<string>} ID do novo documento
 */
export async function createBanner(data, explicitId) {
  // Sem documento anterior: todo campo traduzível conta como "novo".
  const translations = await translateRootFields(data, null, BANNER_TRANSLATABLE_FIELDS);
  // deepNullifyUndefined no payload final (depois de ...translations), não
  // só em `data` — mesmo motivo de services/events.js: um campo opcional
  // vazio (ex: ctaButtonBg/ctaButtonText) pode chegar undefined, e o
  // Firestore rejeita a escrita inteira se sobrar um só.
  const payload = deepNullifyUndefined({ ...data, ...translations, createdAt: new Date() });

  if (explicitId) {
    await setDoc(doc(db, BANNERS_COLLECTION, explicitId), payload);
    return explicitId;
  }

  const docRef = await addDoc(collection(db, BANNERS_COLLECTION), payload);
  return docRef.id;
}

export async function updateBanner(id, data) {
  const docRef = doc(db, BANNERS_COLLECTION, id);
  // Busca o documento atual só pra diff de tradução — evita rechamar a API
  // quando o texto de origem não mudou (ver utils/writeTimeTranslation.js).
  const snapshot = await getDoc(docRef);
  const previous = snapshot.exists() ? snapshot.data() : null;
  const translations = await translateRootFields(data, previous, BANNER_TRANSLATABLE_FIELDS);

  await updateDoc(docRef, deepNullifyUndefined({
    ...data,
    ...translations,
    updatedAt: new Date(),
  }));
}

export async function deleteBanner(id) {
  const docRef = doc(db, BANNERS_COLLECTION, id);
  await deleteDoc(docRef);
}

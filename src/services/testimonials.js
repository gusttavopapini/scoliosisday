// src/services/testimonials.js
// Serviço de depoimentos (/painel/depoimentos): CRUD no Firestore.
// Coleção própria — não confundir com o array `testimonials` embutido em
// cada evento, que a Home ainda lê separadamente.
//
// `date` é Timestamp no Firestore (consistente com createdAt/updatedAt),
// mas o formulário usa <input type="date">, que só fala "YYYY-MM-DD". As
// duas funções abaixo convertem nessa borda para que o resto do app —
// schema, formulário, tabela — nunca precise saber que o Firestore guarda
// Timestamp.

import {
  collection,
  query,
  where,
  orderBy,
  limit,
  getDocs,
  getDoc,
  addDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  doc,
  Timestamp,
} from 'firebase/firestore';
import { db } from '../config/firebase.js';

const TESTIMONIALS_COLLECTION = 'testimonials';
const PAGE_SIZE = 50;

/**
 * "YYYY-MM-DD" (valor cru do <input type="date">) → Timestamp à meia-noite
 * local. Monta a partir dos componentes em vez de `new Date(string)`: essa
 * forma interpretaria a string como UTC e exibiria um dia a menos em fusos
 * negativos (Brasil).
 */
function toDateTimestamp(dateString) {
  const [year, month, day] = dateString.split('-').map(Number);
  return Timestamp.fromDate(new Date(year, month - 1, day));
}

/** Timestamp do Firestore → "YYYY-MM-DD", para popular o <input type="date">
 * e para a tabela formatar. getFullYear/getMonth/getDate (hora local) em vez
 * de toISOString (UTC) — mesmo motivo do comentário acima. */
function fromDateTimestamp(value) {
  const date = value?.toDate ? value.toDate() : null;
  if (!date) return '';
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// id por último: ver a nota em services/events.js.
const mapDocs = (snapshot) =>
  snapshot.docs.map((snap) => {
    const data = snap.data();
    return { ...data, date: fromDateTimestamp(data.date), id: snap.id };
  });

/**
 * Depoimentos de um type, mais recentes primeiro, até 50 — a tela de
 * listagem busca uma aba de cada vez (query própria por type, não filtro no
 * cliente), porque diferente de eventos/colaboradores/patrocinadores esta é
 * uma coleção de marketing que só cresce, sem curadoria que a mantenha
 * pequena. Exige o índice composto (type ASC, date DESC) — ver
 * firestore.indexes.json.
 */
export async function fetchTestimonials(type) {
  const q = query(
    collection(db, TESTIMONIALS_COLLECTION),
    where('type', '==', type),
    orderBy('date', 'desc'),
    limit(PAGE_SIZE),
  );
  return mapDocs(await getDocs(q));
}

export async function fetchTestimonialById(id) {
  const docRef = doc(db, TESTIMONIALS_COLLECTION, id);
  const snapshot = await getDoc(docRef);
  if (!snapshot.exists()) return null;
  const data = snapshot.data();
  return { ...data, date: fromDateTimestamp(data.date), id: snapshot.id };
}

/**
 * Gera um ID de documento no cliente, sem gravar nada ainda — o upload de
 * vídeo (quando MP4) precisa dele para montar o caminho no Storage
 * (testimonials/{id}/video), antes do primeiro salvamento do formulário.
 * Mesmo padrão de newSponsorId em services/sponsors.js.
 */
export function newTestimonialId() {
  return doc(collection(db, TESTIMONIALS_COLLECTION)).id;
}

/**
 * Cria um depoimento. Com `explicitId`, grava naquele ID (o mesmo já usado
 * no caminho do vídeo, se houver); sem ele, deixa o Firestore sortear.
 */
export async function createTestimonial(data, createdBy, explicitId) {
  const payload = {
    ...data,
    date: toDateTimestamp(data.date),
    createdBy,
    createdAt: new Date(),
  };

  if (explicitId) {
    await setDoc(doc(db, TESTIMONIALS_COLLECTION, explicitId), payload);
    return explicitId;
  }

  const docRef = await addDoc(collection(db, TESTIMONIALS_COLLECTION), payload);
  return docRef.id;
}

export async function updateTestimonial(id, data) {
  const docRef = doc(db, TESTIMONIALS_COLLECTION, id);
  await updateDoc(docRef, {
    ...data,
    date: toDateTimestamp(data.date),
    updatedAt: new Date(),
  });
}

export async function deleteTestimonial(id) {
  const docRef = doc(db, TESTIMONIALS_COLLECTION, id);
  await deleteDoc(docRef);
}

// src/services/collaborators.js
// Serviço de colaboradores: CRUD no Firestore.

import {
  collection,
  query,
  where,
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
  writeBatch,
} from 'firebase/firestore';
import { db } from '../config/firebase.js';
import { translateRootFields } from '../utils/writeTimeTranslation.js';
import { translateHtmlForStorage } from '../utils/translateForStorage.js';
import { COLLABORATOR_TYPES } from '../utils/constants.js';

const COLLABORATORS_COLLECTION = 'collaborators';

/** Tamanho de página das listagens. */
export const COLLABORATORS_PAGE_SIZE = 20;

// id por último: ver a nota em services/events.js.
const mapDocs = (snapshot) => snapshot.docs.map((snap) => ({ ...snap.data(), id: snap.id }));

/**
 * Todos os colaboradores, ordenados. Usado pelos seletores de palestrantes do
 * wizard de eventos e do formulário de programações, que precisam da lista
 * inteira para resolver as referências já gravadas.
 * As telas de listagem usam fetchCollaboratorsPage.
 * @returns {Promise<Array>}
 */
export async function fetchCollaborators() {
  const q = query(collection(db, COLLABORATORS_COLLECTION), orderBy('createdAt', 'desc'));
  return mapDocs(await getDocs(q));
}

/**
 * Uma página de colaboradores.
 * @param {{ pageSize?: number, cursor?: import('firebase/firestore').QueryDocumentSnapshot|null }} [options]
 * @returns {Promise<{ items: object[], nextCursor: object|null }>}
 */
export async function fetchCollaboratorsPage({
  pageSize = COLLABORATORS_PAGE_SIZE,
  cursor = null,
} = {}) {
  const constraints = [orderBy('createdAt', 'desc')];
  if (cursor) constraints.push(startAfter(cursor));
  constraints.push(limit(pageSize));

  const snapshot = await getDocs(query(collection(db, COLLABORATORS_COLLECTION), ...constraints));
  return {
    items: mapDocs(snapshot),
    nextCursor: snapshot.docs.length === pageSize ? snapshot.docs[snapshot.docs.length - 1] : null,
  };
}

/**
 * Totais de colaboradores por tipo, sem trazer os documentos.
 * @returns {Promise<{ total: number, byType: Record<string, number> }>}
 */
export async function countCollaborators() {
  const collectionRef = collection(db, COLLABORATORS_COLLECTION);
  const types = [
    COLLABORATOR_TYPES.SPEAKER,
    COLLABORATOR_TYPES.SCIENTIFIC_CURATOR,
    COLLABORATOR_TYPES.ORGANIZER,
  ];

  const [totalSnap, ...typeSnaps] = await Promise.all([
    getCountFromServer(collectionRef),
    ...types.map((type) => getCountFromServer(query(collectionRef, where('type', '==', type)))),
  ]);

  return {
    total: totalSnap.data().count,
    byType: Object.fromEntries(types.map((type, i) => [type, typeSnaps[i].data().count])),
  };
}

/**
 * Busca um colaborador por ID.
 * @param {string} id
 * @returns {Promise<Object|null>}
 */
export async function fetchCollaboratorById(id) {
  const docRef = doc(db, COLLABORATORS_COLLECTION, id);
  const snapshot = await getDoc(docRef);
  if (!snapshot.exists()) return null;
  // id por último: ver a nota em services/events.js.
  return {
    ...snapshot.data(),
    id: snapshot.id,
  };
}

/**
 * Busca colaboradores por tipo.
 * @param {string} type
 * @returns {Promise<Array>}
 */
export async function fetchCollaboratorsByType(type) {
  const collectionRef = collection(db, COLLABORATORS_COLLECTION);
  // where + orderBy em campos distintos: exige o índice composto
  // (type ASC, createdAt DESC) declarado em firestore.indexes.json.
  const q = query(collectionRef, where('type', '==', type), orderBy('createdAt', 'desc'));
  return mapDocs(await getDocs(q));
}

/**
 * Gera um ID de documento no cliente, sem gravar nada ainda.
 *
 * O upload da foto precisa do ID para montar o caminho no Storage
 * (collaborators/{id}/photo), e ele acontece antes de o formulário ser
 * salvo. Mesmo padrão de newEventId em services/events.js.
 */
// Campos traduzidos ao SALVAR (Parte 2 do fix de tradução — ver
// utils/writeTimeTranslation.js). Esta coleção nunca havia entrado no
// fluxo: o currículo aparecia em português na versão em inglês do site.
//
// Só `curriculum`. `fullName`/`firstName`/`lastName` não se traduzem —
// nome próprio mandado pra API volta adulterado; o ajuste de "Dra." para
// "Dr." acontece na leitura, sem API (utils/honorifics.js). `flag` é
// código ISO e `type` é enum, nenhum dos dois é conteúdo.
const COLLABORATOR_TRANSLATABLE_FIELDS = ['curriculum'];

// O currículo é HTML do editor rico (TipTap), não texto puro: vai com o
// tradutor que percorre os nós de texto e preserva as tags. Traduzir a
// string inteira devolveria as tags escapadas — era a razão documentada
// em PersonModal.jsx para esse campo nunca ter sido traduzido.
const COLLABORATOR_TRANSLATOR = translateHtmlForStorage;

export function newCollaboratorId() {
  return doc(collection(db, COLLABORATORS_COLLECTION)).id;
}

/**
 * Cria um colaborador. Com `explicitId`, grava naquele ID (o mesmo já usado
 * no caminho da foto); sem ele, deixa o Firestore sortear.
 * @param {Object} data
 * @param {string} [explicitId]
 * @returns {Promise<string>} ID do novo documento
 */
export async function createCollaborator(data, explicitId) {
  const payload = {
    ...data,
    // Criação: sem documento anterior, o currículo é traduzido agora.
    // Falha grava `curriculum_en: null` e não impede o salvamento — o
    // site cai no português, como antes.
    ...(await translateRootFields(data, null, COLLABORATOR_TRANSLATABLE_FIELDS, COLLABORATOR_TRANSLATOR)),
    createdAt: new Date(),
  };

  if (explicitId) {
    await setDoc(doc(db, COLLABORATORS_COLLECTION, explicitId), payload);
    return explicitId;
  }

  const docRef = await addDoc(collection(db, COLLABORATORS_COLLECTION), payload);
  return docRef.id;
}

/**
 * Atualiza um colaborador existente.
 * @param {string} id
 * @param {Object} data
 * @returns {Promise<void>}
 */
export async function updateCollaborator(id, data) {
  const docRef = doc(db, COLLABORATORS_COLLECTION, id);

  // Lê o documento atual só para o diff: currículo inalterado reaproveita
  // o `curriculum_en` existente e não gasta chamada de API. Colaborador
  // antigo (sem `_en`) tem previousEn undefined e cai na tradução — é o
  // que faz reabrir e salvar no painel retroagir o registro.
  const previous = await fetchCollaboratorById(id);

  await updateDoc(docRef, {
    ...data,
    ...(await translateRootFields(data, previous, COLLABORATOR_TRANSLATABLE_FIELDS, COLLABORATOR_TRANSLATOR)),
    updatedAt: new Date(),
  });
}

/**
 * Deleta um colaborador.
 * @param {string} id
 * @returns {Promise<void>}
 */
export async function deleteCollaborator(id) {
  const docRef = doc(db, COLLABORATORS_COLLECTION, id);
  await deleteDoc(docRef);
}

/**
 * Deleta múltiplos colaboradores em batch.
 * @param {Array<string>} ids
 * @returns {Promise<void>}
 */
export async function deleteCollaboratorsBatch(ids) {
  const batch = writeBatch(db);
  ids.forEach((id) => {
    const docRef = doc(db, COLLABORATORS_COLLECTION, id);
    batch.delete(docRef);
  });
  await batch.commit();
}

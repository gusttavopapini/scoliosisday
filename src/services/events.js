// src/services/events.js
// Serviço de eventos: CRUD no Firestore

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
  writeBatch,
  doc,
} from 'firebase/firestore';
import { db } from '../config/firebase.js';
import { eventSlug } from '../utils/slugify.js';
import { EVENT_STATUS } from '../utils/constants.js';
import { translateRootFields, translateArrayFields } from '../utils/writeTimeTranslation.js';
import { deepNullifyUndefined } from '../utils/firestoreSanitize.js';

const EVENTS_COLLECTION = 'events';

/** Tamanho de página das listagens. */
export const EVENTS_PAGE_SIZE = 20;

// id por último, DEPOIS do spread: alguns documentos guardam um campo `id`
// (herdado de gravações antigas que não o removiam do payload). Com o spread
// depois, esse campo sobrescreveria o id real do documento — e uma cópia
// passaria a se identificar como o original, fazendo a exclusão apagar o
// documento errado.
const mapDocs = (snapshot) => snapshot.docs.map((snap) => ({ ...snap.data(), id: snap.id }));

/**
 * Remove isCurrent de um payload de escrita.
 *
 * "Só um evento é o atual" é uma invariante entre documentos, e por isso
 * pertence a setCurrentEvent, que a mantém em um writeBatch. Se createEvent ou
 * saveEvent também gravassem o campo, publicar um evento com o toggle ligado
 * criaria um segundo atual sem desmarcar o primeiro.
 */
function withoutCurrentFlag(data) {
  const { isCurrent: _ignored, ...rest } = data;
  return rest;
}

/**
 * Remove o campo `id` do payload de escrita.
 *
 * O id do documento é o nome dele na coleção, não um dado dentro dele. Quando
 * o formulário de edição recebe `{ id, ...dados }` e devolve tudo ao salvar, o
 * id acaba gravado como campo — e aí duplicar o evento (que copia todos os
 * campos) faz a cópia carregar o id do original. Toda leitura passa a
 * confundir os dois documentos.
 */
function withoutIdField(data) {
  const { id: _ignored, ...rest } = data;
  return rest;
}

/**
 * As três limpezas que todo payload de escrita precisa. deepNullifyUndefined
 * (utils/firestoreSanitize.js) é recursivo de propósito: um payload de
 * evento tem undefined em risco em qualquer nível (presentation[],
 * archiveStats[], gallery[], colors{} — todo array de objeto ou objeto
 * aninhado do schema), não só nas chaves de raiz. Uma versão só de raiz já
 * causou bug numa rodada anterior: os itens de presentation/archiveStats
 * voltam de translateArrayFields (writeTimeTranslation.js) via
 * `...translations`, espalhado no payload DEPOIS deste sanitizeWrite(data)
 * — por isso cada função de escrita abaixo aplica deepNullifyUndefined de
 * novo no payload FINAL, já com translations/status/slug mesclados.
 */
function sanitizeWrite(data) {
  return deepNullifyUndefined(withoutIdField(withoutCurrentFlag(data)));
}

// Campos de texto livre traduzidos ao salvar (Parte 2 do fix de tradução —
// ver utils/writeTimeTranslation.js). presentation/archiveStats são
// arrays de posição fixa (3 itens cada); os demais são campos de raiz.
const EVENT_ROOT_TRANSLATABLE_FIELDS = ['headline', 'subtitle', 'cta', 'archiveTitle', 'archiveSubtitle'];
const PRESENTATION_TRANSLATABLE_FIELDS = ['title', 'description'];
const ARCHIVE_STAT_TRANSLATABLE_FIELDS = ['title', 'description'];

/**
 * Traduz pra inglês, uma vez, só o que mudou desde `previous` — devolve um
 * objeto parcial pronto pra entrar no spread do payload de escrita
 * (`headline_en`, `presentation` já com `title_en`/`description_en` em
 * cada item, etc.). Nunca lança: falha de tradução vira null no campo
 * `_en` (ver translateTextForStorage), não bloqueia o salvamento do
 * conteúdo original.
 * @param {object} data
 * @param {object|null} previous
 */
async function translateEventFields(data, previous) {
  const result = await translateRootFields(data, previous, EVENT_ROOT_TRANSLATABLE_FIELDS);

  if (Array.isArray(data.presentation)) {
    result.presentation = await translateArrayFields(
      data.presentation,
      previous?.presentation,
      PRESENTATION_TRANSLATABLE_FIELDS,
    );
  }

  if (Array.isArray(data.archiveStats)) {
    result.archiveStats = await translateArrayFields(
      data.archiveStats,
      previous?.archiveStats,
      ARCHIVE_STAT_TRANSLATABLE_FIELDS,
    );
  }

  return result;
}

/** Gera um ID de documento no cliente, sem gravar nada ainda. */
export function newEventId() {
  return doc(collection(db, EVENTS_COLLECTION)).id;
}

/**
 * Todos os eventos, ordenados. Usado pelos seletores de formulário, que
 * precisam da lista inteira para resolver as referências já gravadas.
 * As telas de listagem usam fetchEventsPage.
 */
export async function fetchEvents() {
  const q = query(collection(db, EVENTS_COLLECTION), orderBy('createdAt', 'desc'));
  return mapDocs(await getDocs(q));
}

/**
 * Uma página de eventos. O cursor é o último QueryDocumentSnapshot da página
 * anterior — devolvido em nextCursor, ou null quando a lista acabou.
 * @param {{ pageSize?: number, cursor?: import('firebase/firestore').QueryDocumentSnapshot|null }} [options]
 * @returns {Promise<{ items: object[], nextCursor: object|null }>}
 */
export async function fetchEventsPage({ pageSize = EVENTS_PAGE_SIZE, cursor = null } = {}) {
  const constraints = [orderBy('createdAt', 'desc')];
  if (cursor) constraints.push(startAfter(cursor));
  constraints.push(limit(pageSize));

  const snapshot = await getDocs(query(collection(db, EVENTS_COLLECTION), ...constraints));
  return {
    items: mapDocs(snapshot),
    // Página cheia significa que provavelmente há mais; a próxima chamada confirma.
    nextCursor: snapshot.docs.length === pageSize ? snapshot.docs[snapshot.docs.length - 1] : null,
  };
}

/**
 * Os eventos editados mais recentemente — cartão do dashboard.
 * Ordena por updatedAt (o critério é "editado", não "criado").
 */
export async function fetchRecentEvents(max = 5) {
  const q = query(collection(db, EVENTS_COLLECTION), orderBy('updatedAt', 'desc'), limit(max));
  return mapDocs(await getDocs(q));
}

/**
 * Totais de eventos sem trazer os documentos: um agregado por status mais o
 * total geral, cobrados como leituras fracionadas em vez de N documentos.
 * @returns {Promise<{ total: number, byStatus: Record<string, number> }>}
 */
export async function countEvents() {
  const collectionRef = collection(db, EVENTS_COLLECTION);
  const statuses = [EVENT_STATUS.DRAFT, EVENT_STATUS.PUBLISHED, EVENT_STATUS.ARCHIVED];

  const [totalSnap, ...statusSnaps] = await Promise.all([
    getCountFromServer(collectionRef),
    ...statuses.map((status) =>
      getCountFromServer(query(collectionRef, where('status', '==', status))),
    ),
  ]);

  return {
    total: totalSnap.data().count,
    byStatus: Object.fromEntries(
      statuses.map((status, i) => [status, statusSnaps[i].data().count]),
    ),
  };
}

export async function fetchEventById(id) {
  const docRef = doc(db, EVENTS_COLLECTION, id);
  const docSnap = await getDoc(docRef);
  return docSnap.exists() ? { ...docSnap.data(), id: docSnap.id } : null;
}

export async function createEvent(data) {
  const collectionRef = collection(db, EVENTS_COLLECTION);
  // Sanitizado de novo ao final: sanitizeWrite(data) já limpa o `data` de
  // entrada, mas os campos gerados aqui embaixo (status/slug) são
  // literais seguros — o ponto é blindar o payload INTEIRO no formato que
  // de fato vai pro setDoc, não confiar que cada pedaço já chegou limpo.
  const payload = deepNullifyUndefined({
    ...sanitizeWrite(data),
    // Respeita o status enviado pelo formulário; 'draft' é apenas o padrão.
    status: data.status ?? 'draft',
    slug: data.slug || eventSlug(data.headline),
    // Nasce fora do destaque: virar o atual é sempre um ato explícito,
    // via setCurrentEvent.
    isCurrent: false,
    createdAt: new Date(),
    updatedAt: new Date(),
  });
  if (import.meta.env.DEV) console.debug('[events] createEvent payload', payload);

  const docRef = await addDoc(collectionRef, payload);
  return docRef.id;
}

export async function updateEvent(id, data) {
  const docRef = doc(db, EVENTS_COLLECTION, id);
  const payload = deepNullifyUndefined({
    ...sanitizeWrite(data),
    slug: data.slug || eventSlug(data.headline),
    updatedAt: new Date(),
  });
  if (import.meta.env.DEV) console.debug('[events] updateEvent payload', payload);

  await updateDoc(docRef, payload);
}

/**
 * Grava um evento em um ID conhecido (gerado no cliente por newEventId).
 * Usa merge para servir tanto ao primeiro salvamento de rascunho quanto às
 * atualizações seguintes, sem duplicar documentos.
 *
 * Traduz pra inglês aqui dentro (Parte 2 do fix de tradução) — é o único
 * caminho de escrita que o EventForm de fato usa (rascunho automático,
 * "Salvar alterações" e publicar final passam todos por useSaveEvent →
 * saveEvent), então é o ponto certo pra centralizar isso. O diff contra
 * `snapshot` (já buscado aqui mesmo, sem leitura extra) evita rechamar a
 * API a cada tick do rascunho automático quando o texto não mudou.
 */
export async function saveEvent(id, data) {
  const docRef = doc(db, EVENTS_COLLECTION, id);
  const snapshot = await getDoc(docRef);
  const previous = snapshot.exists() ? snapshot.data() : null;
  const now = new Date();

  const translations = await translateEventFields(data, previous);

  // Sanitizado de novo depois de ...translations: translateArrayFields
  // (ver writeTimeTranslation.js) reconstrói cada item de
  // presentation/archiveStats como `{...item, ...traduções}` a partir do
  // `data` ORIGINAL, sem passar pela limpeza de sanitizeWrite(data) — um
  // undefined ali (ex: item novo de archiveStats ainda sem os campos
  // opcionais preenchidos) chegava intacto no setDoc(). deepNullifyUndefined
  // no payload final, depois de todos os spreads, fecha essa brecha.
  const payload = deepNullifyUndefined({
    ...sanitizeWrite(data),
    ...translations,
    status: data.status ?? 'draft',
    slug: data.slug || eventSlug(data.headline),
    // Na criação o campo nasce false; em atualizações não é tocado, para
    // não desfazer o que setCurrentEvent decidiu.
    ...(snapshot.exists() ? {} : { createdAt: now, isCurrent: false }),
    updatedAt: now,
  });
  if (import.meta.env.DEV) console.debug('[events] saveEvent payload', payload);

  await setDoc(docRef, payload, { merge: true });

  return id;
}

/**
 * O evento em destaque, ou null. A listagem o busca à parte para exibi-lo
 * sempre no topo, mesmo quando ele cairia em uma página posterior.
 * @returns {Promise<object|null>}
 */
export async function fetchCurrentEvent() {
  const q = query(
    collection(db, EVENTS_COLLECTION),
    where('isCurrent', '==', true),
    limit(1),
  );
  const snapshot = await getDocs(q);
  return snapshot.empty ? null : { ...snapshot.docs[0].data(), id: snapshot.docs[0].id };
}

/**
 * O evento em destaque visível ao público, ou null.
 *
 * Gêmea de fetchCurrentEvent, com o filtro de status embutido. A duplicação é
 * proposital: a regra do Firestore libera /events só para status
 * 'published', e numa consulta anônima o filtro precisa estar na query — o
 * Firestore recusa a operação inteira quando não consegue provar de antemão
 * que todo documento retornado passa na regra. A versão de painel não pode
 * ganhar o filtro porque ela existe justamente para enxergar rascunhos.
 *
 * @returns {Promise<object|null>}
 */
export async function fetchCurrentPublicEvent() {
  const q = query(
    collection(db, EVENTS_COLLECTION),
    where('isCurrent', '==', true),
    where('status', '==', EVENT_STATUS.PUBLISHED),
    limit(1),
  );
  const snapshot = await getDocs(q);
  return snapshot.empty ? null : { ...snapshot.docs[0].data(), id: snapshot.docs[0].id };
}

/**
 * Todos os eventos publicados, mais recentes primeiro — site público.
 *
 * A ordenação é feita aqui, não na query: where('status') + orderBy exigiria
 * um índice composto só para isso, e a coleção tem poucos eventos por ano.
 * Uma única busca alimenta o contador de edições e o evento mais recente
 * (depoimentos da Home), então quem consome não repete a viagem.
 *
 * O filtro de status é obrigatório mesmo que se quisesse tudo: é ele que
 * prova à regra do Firestore que a consulta anônima só alcança publicados.
 *
 * @returns {Promise<object[]>}
 */
export async function fetchPublishedEvents() {
  const q = query(
    collection(db, EVENTS_COLLECTION),
    where('status', '==', EVENT_STATUS.PUBLISHED),
  );
  const snapshot = await getDocs(q);
  return mapDocs(snapshot).sort(
    (a, b) => (b.createdAt?.toMillis?.() ?? 0) - (a.createdAt?.toMillis?.() ?? 0),
  );
}

/**
 * Marca um evento como o atual e desmarca o anterior, de forma atômica.
 *
 * As duas escritas vão em um único writeBatch: ou as duas valem, ou nenhuma.
 * Sem isso, uma falha entre elas deixaria dois eventos atuais (ou nenhum).
 *
 * A busca não usa limit(1): se a coleção já tiver mais de um marcado — dado
 * legado, escrita manual pelo console — todos são desmarcados, e a chamada
 * conserta a invariante em vez de propagá-la quebrada.
 *
 * @param {string} eventId
 * @returns {Promise<void>}
 */
export async function setCurrentEvent(eventId) {
  const collectionRef = collection(db, EVENTS_COLLECTION);
  const previous = await getDocs(query(collectionRef, where('isCurrent', '==', true)));

  const batch = writeBatch(db);
  const now = new Date();

  for (const snap of previous.docs) {
    // Já é o atual: nada a desmarcar, e desmarcar aqui o apagaria antes de
    // a linha seguinte remarcá-lo.
    if (snap.id === eventId) continue;
    batch.update(snap.ref, { isCurrent: false, updatedAt: now });
  }

  batch.update(doc(db, EVENTS_COLLECTION, eventId), { isCurrent: true, updatedAt: now });

  await batch.commit();
}

/**
 * Tira um evento do destaque, deixando a plataforma sem evento atual.
 *
 * Estado legítimo — é o que existe antes de alguém marcar o primeiro. Aqui
 * um único documento muda, então não há nada para tornar atômico.
 *
 * @param {string} eventId
 * @returns {Promise<void>}
 */
export async function clearCurrentEvent(eventId) {
  await updateDoc(doc(db, EVENTS_COLLECTION, eventId), {
    isCurrent: false,
    updatedAt: new Date(),
  });
}

export async function deleteEvent(id) {
  const docRef = doc(db, EVENTS_COLLECTION, id);
  await deleteDoc(docRef);
}

export async function publishEvent(id) {
  const docRef = doc(db, EVENTS_COLLECTION, id);
  const docSnap = await getDoc(docRef);
  if (!docSnap.exists()) throw new Error('Evento não encontrado');
  const isPublished = docSnap.data().status === 'published';
  await updateDoc(docRef, {
    status: isPublished ? 'draft' : 'published',
    updatedAt: new Date(),
  });
}

export async function duplicateEvent(id) {
  const docRef = doc(db, EVENTS_COLLECTION, id);
  const docSnap = await getDoc(docRef);
  if (!docSnap.exists()) throw new Error('Evento não encontrado');
  // sanitizeWrite tira o campo `id` que documentos antigos carregam: sem isso
  // a cópia nasce apontando para o id do original, e passa a ser confundida
  // com ele em toda leitura (inclusive na exclusão).
  const original = sanitizeWrite(docSnap.data());
  const copyHeadline = `${original.headline} (cópia)`;
  const payload = deepNullifyUndefined({
    ...original,
    headline: copyHeadline,
    // Deriva do headline da cópia: o slug do original pode não existir.
    slug: `${eventSlug(copyHeadline)}-${Date.now()}`,
    status: 'draft',
    // Duplicar o evento atual não pode produzir um segundo atual.
    isCurrent: false,
    createdAt: new Date(),
    updatedAt: new Date(),
  });
  if (import.meta.env.DEV) console.debug('[events] duplicateEvent payload', payload);

  const newDocRef = await addDoc(collection(db, EVENTS_COLLECTION), payload);
  return newDocRef.id;
}

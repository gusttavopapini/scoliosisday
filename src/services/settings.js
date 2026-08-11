// src/services/settings.js
// Configurações globais do site — hoje só redes sociais, num único
// documento (settings/socialMedia). Fica aberto a outras chaves no
// mesmo documento no futuro (ex: settings/socialMedia poderia crescer
// pra outras coisas), mas por ora só grava/lê `socialLinks`.

import { collection, doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../config/firebase.js';
import { deepNullifyUndefined } from '../utils/firestoreSanitize.js';

const SETTINGS_COLLECTION = 'settings';
const SOCIAL_MEDIA_DOC_ID = 'socialMedia';

/** Gera um ID de item de rede social no cliente, sem gravar nada ainda —
 *  mesmo truque de newEventId()/newBannerId() (services/events.js,
 *  services/banners.js): um ID de documento nunca usado como documento
 *  de verdade, só como string única. */
export function newSocialLinkId() {
  return doc(collection(db, SETTINGS_COLLECTION)).id;
}

/**
 * @returns {Promise<{ id: string, platform: string, url: string, order: number, active: boolean }[]>}
 */
export async function fetchSocialLinks() {
  const docRef = doc(db, SETTINGS_COLLECTION, SOCIAL_MEDIA_DOC_ID);
  const snapshot = await getDoc(docRef);
  if (!snapshot.exists()) return [];
  return snapshot.data().socialLinks ?? [];
}

/**
 * Grava a lista inteira (substitui, não faz merge item a item — o modal
 * sempre manda o array completo, já reordenado/filtrado do jeito que deve
 * ficar salvo).
 * @param {{ id: string, platform: string, url: string, order: number, active: boolean }[]} socialLinks
 */
export async function saveSocialLinks(socialLinks) {
  const docRef = doc(db, SETTINGS_COLLECTION, SOCIAL_MEDIA_DOC_ID);
  await setDoc(
    docRef,
    deepNullifyUndefined({ socialLinks, updatedAt: new Date() }),
    { merge: true },
  );
}

// src/services/seoSettings.js
// Metadados de compartilhamento do site (settings/seo) — hoje só a imagem
// de preview de link (og:image). Documento SEPARADO de settings/socialMedia
// de propósito, embora as duas coisas sejam editadas na mesma tela:
//
//   · settings/socialMedia é lido por TODO visitante, em tempo de execução,
//     para montar o rodapé.
//   · settings/seo é lido pelo BUILD (scripts/prerender-seo.mjs), que assa
//     a URL da imagem no HTML das 5 rotas. Nenhum visitante o lê.
//
// Leitores e ciclos de vida diferentes, documentos diferentes. Os dois já
// são cobertos pela regra /settings/{id} do firestore.rules (leitura
// pública, escrita restrita ao painel) — a leitura pública é o que permite
// o script de build buscar o documento pela API REST sem credencial.
//
// A estrutura nasce preparada para ogTitle/ogDescription editáveis, que
// ficaram para uma próxima rodada: eles entram como chaves irmãs de
// ogImage, sem refatorar nada do que está aqui.

import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../config/firebase.js';
import { deepNullifyUndefined } from '../utils/firestoreSanitize.js';

const SETTINGS_COLLECTION = 'settings';
const SEO_DOC_ID = 'seo';

/**
 * Forma vazia do bloco de imagem — o estado de antes de qualquer upload.
 *
 * Devolvido (em vez de null) quando o documento não existe, para a tela não
 * precisar tratar dois "vazios" diferentes. Com `url: null` o site cai no
 * og-image.png estático, que é exatamente o comportamento de hoje.
 */
const EMPTY_OG_IMAGE = {
  url: null,
  storagePath: null,
  version: null,
  width: null,
  height: null,
  sizeBytes: null,
};

/**
 * Metadados de compartilhamento salvos.
 *
 * @returns {Promise<{ ogImage: typeof EMPTY_OG_IMAGE }>}
 */
export async function fetchSeoSettings() {
  const snapshot = await getDoc(doc(db, SETTINGS_COLLECTION, SEO_DOC_ID));
  if (!snapshot.exists()) return { ogImage: { ...EMPTY_OG_IMAGE } };

  const data = snapshot.data();
  // Mesclado com a forma vazia, não usado direto: um documento gravado
  // antes de algum destes campos existir não pode fazer a tela ler
  // undefined. Cada chave ausente cai no null seguro.
  return { ogImage: { ...EMPTY_OG_IMAGE, ...(data.ogImage ?? {}) } };
}

/**
 * Grava o bloco da imagem de preview.
 *
 * setDoc com merge:true — o documento é compartilhado com os futuros
 * ogTitle/ogDescription, e uma escrita daqui não pode apagá-los. Dentro de
 * `ogImage`, porém, o objeto é substituído inteiro: os seis campos sempre
 * viajam juntos e um deles sobreviver de um upload anterior seria pior que
 * o valor sumir (largura antiga com imagem nova, por exemplo).
 *
 * deepNullifyUndefined é a rede de segurança de sempre: nenhum undefined
 * pode chegar ao Firestore, nem no nível de `ogImage`.
 *
 * @param {{ url: string|null, storagePath: string|null, version: string|null,
 *   width: number|null, height: number|null, sizeBytes: number|null }} ogImage
 */
export async function saveOgImage(ogImage) {
  await setDoc(
    doc(db, SETTINGS_COLLECTION, SEO_DOC_ID),
    deepNullifyUndefined({
      ogImage: { ...EMPTY_OG_IMAGE, ...ogImage },
      updatedAt: new Date(),
    }),
    { merge: true },
  );
}

/**
 * Volta ao og-image.png estático: zera os campos, sem apagar o documento.
 *
 * Não remove a chave nem o documento de propósito. `version: null` é uma
 * MUDANÇA de versão como qualquer outra, então a Cloud Function
 * (functions/index.js) detecta e dispara o rebuild — é isso que faz a
 * remoção chegar ao HTML. Apagar o documento silenciosamente também
 * funcionaria para o site, mas deixaria o histórico do que houve ali sem
 * rastro, e o projeto não apaga dado histórico.
 */
export function clearOgImage() {
  return saveOgImage({ ...EMPTY_OG_IMAGE });
}

// src/services/storageService.js
// Upload, remoção e validação de arquivos no Firebase Storage.
//
// Os limites daqui são espelhados em storage.rules. A validação no cliente
// existe para dar erro imediato e legível antes de gastar banda; quem de fato
// barra é a regra no servidor, porque o cliente é contornável.

import {
  ref,
  uploadBytesResumable,
  getDownloadURL,
  deleteObject,
} from 'firebase/storage';
import { storage } from '../config/firebase.js';

/**
 * Presets por tipo de campo. Mantidos aqui — e não espalhados pelos
 * formulários — para que o limite exibido ao usuário, o validado no cliente e
 * o escrito em storage.rules não possam divergir em silêncio.
 */
export const UPLOAD_PRESETS = {
  collaboratorPhoto: {
    maxSizeMB: 2,
    allowedTypes: ['image/jpeg', 'image/png', 'image/webp'],
  },
  sponsorLogo: {
    maxSizeMB: 1,
    allowedTypes: ['image/png', 'image/svg+xml', 'image/webp'],
  },
  eventBanner: {
    maxSizeMB: 5,
    allowedTypes: ['image/jpeg', 'image/png', 'image/webp'],
  },
  eventGallery: {
    maxSizeMB: 5,
    allowedTypes: ['image/jpeg', 'image/png', 'image/webp'],
  },
  testimonialVideo: {
    maxSizeMB: 100,
    allowedTypes: ['video/mp4'],
  },
  // Vídeo da seção de vídeo de uma edição (videoBlock, passo de vídeo do
  // wizard). Mesmo teto de 100MB do depoimento em vídeo — o limite não é
  // técnico, é de custo: o Storage no plano Blaze cobra banda por
  // exibição. WEBM entra além do MP4 (o depoimento só aceita MP4) porque
  // os dois tocam em <video> sem plugin em todo navegador atual, e o WEBM
  // costuma sair bem menor no mesmo nível de qualidade.
  eventVideo: {
    maxSizeMB: 100,
    allowedTypes: ['video/mp4', 'video/webm'],
  },
  // Imagem de preview de link (og:image). 2MB é o limite duro, espelhado em
  // storage.rules. O número que importa na prática é outro e menor — acima
  // de ~600KB o WhatsApp para de exibir a miniatura grande —, mas esse é
  // AVISO, não bloqueio: fica em OG_IMAGE_GUIDELINES (utils/ogImage.js),
  // fora do preset, justamente porque validateFile lança erro e aqui não se
  // quer impedir o envio.
  ogImage: {
    maxSizeMB: 2,
    allowedTypes: ['image/jpeg', 'image/png', 'image/webp'],
  },
};

/** Extensão canônica por MIME — não confia na extensão do nome original. */
const EXTENSION_BY_TYPE = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'image/svg+xml': 'svg',
  'video/mp4': 'mp4',
  'video/webm': 'webm',
};

/** Rótulo curto de um MIME, para a mensagem de erro ("JPG, PNG ou WEBP"). */
function typeLabel(mimeType) {
  return (EXTENSION_BY_TYPE[mimeType] ?? mimeType).toUpperCase();
}

/**
 * Valida tipo e tamanho antes de subir. Lança Error com mensagem pronta para
 * exibição — quem chama não precisa traduzir código de erro.
 *
 * @param {File} file
 * @param {{ maxSizeMB: number, allowedTypes: string[] }} constraints
 * @throws {Error} quando o arquivo não serve
 */
export function validateFile(file, { maxSizeMB, allowedTypes }) {
  if (!file) throw new Error('Nenhum arquivo selecionado.');

  if (!allowedTypes.includes(file.type)) {
    const permitidos = allowedTypes.map(typeLabel).join(', ');
    throw new Error(`Formato não suportado. Envie ${permitidos}.`);
  }

  const maxBytes = maxSizeMB * 1024 * 1024;
  if (file.size > maxBytes) {
    const atual = (file.size / (1024 * 1024)).toFixed(1);
    throw new Error(`Arquivo de ${atual}MB excede o limite de ${maxSizeMB}MB.`);
  }
}

/**
 * Caminho completo e único de destino.
 *
 * O nome carrega um sufixo aleatório porque reaproveitar o mesmo nome deixaria
 * a URL antiga em cache (CDN e <img> do navegador) apontando para a imagem
 * trocada. Com nome novo a cada upload, a troca aparece na hora — e o arquivo
 * anterior é removido por deleteFile.
 *
 * @param {string} basePath Ex: 'collaborators/abc123/photo'
 * @param {File} file
 * @returns {string}
 */
function buildStoragePath(basePath, file) {
  const ext = EXTENSION_BY_TYPE[file.type] ?? 'bin';
  const unique = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  return `${basePath}-${unique}.${ext}`;
}

/**
 * Sobe um arquivo e devolve a URL de download.
 *
 * @param {string} basePath Caminho sem extensão. Ex: 'events/abc/banner-desktop'
 * @param {File} file
 * @param {(percent: number) => void} [onProgress] Recebe 0–100.
 * @returns {Promise<string>} URL de download
 */
export function uploadFile(basePath, file, onProgress) {
  return uploadFileWithPath(basePath, file, onProgress).then((result) => result.url);
}

/**
 * Igual a uploadFile, mas devolve `{ url, path }` em vez de só a URL.
 *
 * Existe porque o vídeo da edição grava o caminho no Storage num campo
 * próprio do documento (videoBlock.videoStoragePath) — e o caminho é
 * montado aqui dentro por buildStoragePath, com sufixo aleatório, então
 * quem chama não teria como saber qual foi. Os outros uploads do projeto
 * não precisam dele: apagam pela URL, via deleteFile.
 *
 * @param {string} basePath Caminho sem extensão. Ex: 'events/abc/video/main'
 * @param {File} file
 * @param {(percent: number) => void} [onProgress] Recebe 0–100.
 * @returns {Promise<{ url: string, path: string }>}
 */
export function uploadFileWithPath(basePath, file, onProgress) {
  const fullPath = buildStoragePath(basePath, file);
  const fileRef = ref(storage, fullPath);

  console.info('[storageService] upload iniciado', {
    bucket: fileRef.bucket,
    path: fullPath,
    type: file.type,
    sizeKB: Math.round(file.size / 1024),
  });

  const task = uploadBytesResumable(fileRef, file, { contentType: file.type });

  return new Promise((resolve, reject) => {
    task.on(
      'state_changed',
      (snapshot) => {
        if (!onProgress) return;
        // totalBytes é 0 num intervalo mínimo no início; dividir ali daria NaN.
        const percent = snapshot.totalBytes
          ? Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100)
          : 0;
        onProgress(percent);
      },
      (error) => {
        // O código (storage/unauthorized, storage/unknown…) é o que diz a causa;
        // a mensagem sozinha costuma ser genérica demais para diagnosticar.
        console.error('[storageService] upload FALHOU', {
          code: error?.code,
          message: error?.message,
          serverResponse: error?.customData?.serverResponse,
          bucket: fileRef.bucket,
          path: fullPath,
        });
        reject(error);
      },
      () => {
        console.info('[storageService] upload concluído', fullPath);
        getDownloadURL(task.snapshot.ref).then((url) => resolve({ url, path: fullPath }), (error) => {
          console.error('[storageService] getDownloadURL FALHOU', {
            code: error?.code,
            message: error?.message,
          });
          reject(error);
        });
      },
    );
  });
}

/** Uma URL só é apagável se aponta para o Storage deste projeto. */
function isFirebaseStorageUrl(url) {
  return (
    typeof url === 'string' &&
    (url.startsWith('gs://') ||
      url.includes('firebasestorage.googleapis.com') ||
      url.includes('firebasestorage.app'))
  );
}

/**
 * Apaga um arquivo do Storage a partir da URL de download.
 *
 * Nunca lança: é sempre chamada como faxina depois de um upload que já deu
 * certo, e falhar aqui não pode desfazer o que o usuário acabou de fazer.
 * Ignora em silêncio dois casos legítimos:
 *   • URL externa — vários registros ainda apontam para imagens hospedadas
 *     fora (Canva, gstatic), de antes do Storage existir. Não são nossas.
 *   • objeto inexistente — já foi removido, o fim desejado já é o atual.
 *
 * @param {string} url
 * @returns {Promise<void>}
 */
export async function deleteFile(url) {
  if (!isFirebaseStorageUrl(url)) return;

  try {
    await deleteObject(ref(storage, url));
  } catch (error) {
    if (error?.code === 'storage/object-not-found') return;
    console.error('[storageService] Falha ao apagar arquivo antigo:', url, error);
  }
}

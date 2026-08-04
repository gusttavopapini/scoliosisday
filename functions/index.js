// functions/index.js
// Cloud Functions para Scoliosis Day.
//
// API v2 (firebase-functions/v2). A v1 (`functions.firestore.document(...)`)
// não existe mais na raiz do pacote a partir do firebase-functions 6 — a raiz
// passou a exportar a v2, e o código antigo quebraria na análise do deploy.

import { onDocumentWritten, onDocumentDeleted } from 'firebase-functions/v2/firestore';
import { logger } from 'firebase-functions';
import { initializeApp } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';

initializeApp();

/** Só membros com esta role têm a conta removida automaticamente. */
const STAFF_ROLE = 'staff';

/**
 * syncUserClaims
 * Espelha role e status de users/{uid} nos custom claims do Auth.
 *
 * O formato dos claims não é livre: firestore.rules lê `claims().role` e
 * `claims().status` (isApproved/isAdmin/isStaff). A versão anterior gravava
 * `{ admin: bool, staff: bool }`, que as rules não consultam — e como
 * setCustomUserClaims SUBSTITUI o objeto inteiro, o primeiro login após o
 * deploy apagaria o `{role, status}` posto pelo seedAdmin e barraria o
 * próprio administrador em todas as coleções.
 */
export const syncUserClaims = onDocumentWritten('users/{uid}', async (event) => {
  const { uid } = event.params;
  const after = event.data?.after;

  // Documento apagado: os claims morrem junto com a conta, quando houver
  // conta. Se onStaffDeleted já removeu o usuário do Auth, não há o que
  // limpar — as duas funções reagem ao mesmo evento, sem ordem garantida.
  if (!after?.exists) {
    try {
      await getAuth().setCustomUserClaims(uid, {});
      logger.info(`Claims limpos: ${uid}`);
    } catch (error) {
      if (error.code === 'auth/user-not-found') {
        logger.info(`Conta já removida do Auth, nada a limpar: ${uid}`);
        return;
      }
      throw error;
    }
    return;
  }

  const data = after.data();
  const claims = {
    role: data.role ?? null,
    status: data.status ?? null,
  };

  try {
    await getAuth().setCustomUserClaims(uid, claims);
    logger.info(`Claims sincronizados: ${uid}`, { claims });
  } catch (error) {
    logger.error(`Falha ao sincronizar claims: ${uid}`, error);
    throw error;
  }
});

/**
 * onStaffDeleted
 * Remove a conta do Firebase Auth quando users/{uid} é apagado.
 *
 * O SDK cliente não apaga a conta de terceiros — isso exige o Admin SDK.
 * Sem esta função, excluir um membro pelo painel deixava a conta órfã no
 * Auth e o mesmo e-mail não podia ser cadastrado de novo
 * ("auth/email-already-exists").
 *
 * Só age sobre role === 'staff'. O admin é excluído da automação de
 * propósito: se o documento dele sumir por engano, a conta continua no Auth
 * e o acesso é recuperável.
 */
export const onStaffDeleted = onDocumentDeleted('users/{uid}', async (event) => {
  const { uid } = event.params;
  const data = event.data?.data();

  if (!data) {
    logger.warn(`Evento de exclusão sem snapshot: ${uid}`);
    return;
  }

  if (data.role !== STAFF_ROLE) {
    logger.info(`Ignorado: users/${uid} tinha role "${data.role}", não "${STAFF_ROLE}".`);
    return;
  }

  try {
    await getAuth().deleteUser(uid);
    logger.info(`Conta removida do Auth: ${uid} (${data.email ?? 'sem e-mail'})`);
  } catch (error) {
    // A conta pode já não existir — exclusão manual pelo console, ou reexecução
    // do gatilho. O objetivo (não haver conta órfã) está cumprido.
    if (error.code === 'auth/user-not-found') {
      logger.info(`Conta já não existia no Auth: ${uid}`);
      return;
    }
    logger.error(`Falha ao remover do Auth: ${uid}`, error);
    throw error;
  }
});

// src/services/staff.js
// Serviço da equipe (seção 11.6): aprovação, recusa, desativação,
// remoção e criação manual de membros do painel.
// Exclusivo do administrador — as Security Rules bloqueiam o resto.

import {
  collection,
  query,
  where,
  orderBy,
  getDocs,
  getCountFromServer,
  addDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  doc,
  serverTimestamp,
} from 'firebase/firestore';
import { createUserWithEmailAndPassword, signOut } from 'firebase/auth';
import {
  auth,
  db,
  createSecondaryAuth,
  destroySecondaryAuth,
} from '../config/firebase.js';
import { USER_ROLES, USER_STATUS } from '../utils/constants.js';

const USERS_COLLECTION = 'users';
const MAIL_COLLECTION = 'mail';

/**
 * Busca todos os usuários do painel. A filtragem por aba é feita na UI, então
 * não há limit: paginar aqui esconderia pendentes atrás de aprovados.
 */
export async function fetchStaffUsers() {
  const q = query(collection(db, USERS_COLLECTION), orderBy('createdAt', 'desc'));
  const snapshot = await getDocs(q);
  // id por último: ver a nota em services/events.js.
  return snapshot.docs.map((snap) => ({ ...snap.data(), id: snap.id }));
}

/** Quantos cadastros aguardam aprovação — cartão do dashboard. */
export async function countPendingStaff() {
  const q = query(
    collection(db, USERS_COLLECTION),
    where('status', '==', USER_STATUS.PENDING),
  );
  const snapshot = await getCountFromServer(q);
  return snapshot.data().count;
}

/**
 * Enfileira um e-mail na coleção `mail`, consumida pela extensão Trigger Email.
 * As rules permitem create e proíbem read.
 */
export async function queueApprovalEmail(email) {
  await addDoc(collection(db, MAIL_COLLECTION), {
    to: [email],
    message: {
      subject: 'Seu acesso ao painel Scoliosis Day foi aprovado',
      text:
        'Olá!\n\nSeu cadastro no painel administrativo do Scoliosis Day foi aprovado. ' +
        'Você já pode entrar com o e-mail e a senha que cadastrou.\n\n' +
        'Equipe Scoliosis Day',
      html:
        '<p>Olá!</p>' +
        '<p>Seu cadastro no painel administrativo do <strong>Scoliosis Day</strong> foi aprovado. ' +
        'Você já pode entrar com o e-mail e a senha que cadastrou.</p>' +
        '<p>Equipe Scoliosis Day</p>',
    },
    createdAt: serverTimestamp(),
  });
}

/** Aprova um cadastro pendente e dispara o e-mail de boas-vindas. */
export async function approveStaffUser(uid, email) {
  await updateDoc(doc(db, USERS_COLLECTION, uid), {
    status: USER_STATUS.APPROVED,
    approvedAt: serverTimestamp(),
    approvedBy: auth.currentUser?.uid ?? null,
    updatedAt: serverTimestamp(),
    updatedBy: auth.currentUser?.uid ?? null,
  });

  // O e-mail é acessório: se a extensão falhar, a aprovação continua válida.
  try {
    await queueApprovalEmail(email);
  } catch (error) {
    console.error('Aprovação gravada, mas o e-mail não foi enfileirado:', error);
  }
}

/** Recusa um cadastro pendente. */
export async function rejectStaffUser(uid) {
  await updateDoc(doc(db, USERS_COLLECTION, uid), {
    status: USER_STATUS.REJECTED,
    updatedAt: serverTimestamp(),
    updatedBy: auth.currentUser?.uid ?? null,
  });
}

/** Desativa um membro ativo — perde o acesso, o histórico permanece. */
export async function disableStaffUser(uid) {
  assertNotSelf(uid);
  await updateDoc(doc(db, USERS_COLLECTION, uid), {
    status: USER_STATUS.DISABLED,
    updatedAt: serverTimestamp(),
    updatedBy: auth.currentUser?.uid ?? null,
  });
}

/**
 * Remove o documento do usuário.
 *
 * A conta no Firebase Auth NÃO é removida: o SDK cliente não apaga a conta de
 * terceiros, isso exige o Admin SDK. Sem o doc, porém, o login é barrado
 * (loginUser lança USER_DOC_MISSING) e a Cloud Function syncUserClaims limpa
 * os custom claims.
 */
export async function deleteStaffUser(uid) {
  assertNotSelf(uid);
  await deleteDoc(doc(db, USERS_COLLECTION, uid));
}

/**
 * Cria um membro manualmente, já aprovado e obrigado a trocar a senha.
 *
 * Roda em um app secundário: createUserWithEmailAndPassword autentica a conta
 * nova na instância em que executa, e no app principal isso derrubaria a
 * sessão do admin.
 */
export async function createStaffMember({ email, password }) {
  const normalizedEmail = email.toLowerCase().trim();
  const adminUid = auth.currentUser?.uid ?? null;
  const { secondaryApp, secondaryAuth } = createSecondaryAuth();

  try {
    const cred = await createUserWithEmailAndPassword(
      secondaryAuth,
      normalizedEmail,
      password,
    );

    // Gravado pelo app principal: quem autoriza é o admin (rules: isAdmin()).
    await setDoc(doc(db, USERS_COLLECTION, cred.user.uid), {
      email: normalizedEmail,
      displayName: null,
      role: USER_ROLES.STAFF,
      status: USER_STATUS.APPROVED,
      mustChangePassword: true,
      approvedAt: serverTimestamp(),
      approvedBy: adminUid,
      lastLoginAt: null,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      createdBy: adminUid,
      updatedBy: adminUid,
    });

    await signOut(secondaryAuth);
    return cred.user.uid;
  } finally {
    // Sempre descarta o app secundário, inclusive em caso de erro.
    await destroySecondaryAuth(secondaryApp);
  }
}

/** Barreira de segurança: o admin não age sobre a própria conta. */
function assertNotSelf(uid) {
  if (auth.currentUser?.uid === uid) {
    throw new Error('CANNOT_MODIFY_SELF');
  }
}

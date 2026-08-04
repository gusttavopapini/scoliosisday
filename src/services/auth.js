// src/services/auth.js
// Camada de serviço para Firebase Auth + Firestore user document.
// Toda interação com o Firebase Auth e o doc de usuário passa por aqui.

import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  updatePassword,
  signOut,
} from 'firebase/auth';
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  serverTimestamp,
} from 'firebase/firestore';
import { auth, db } from '../config/firebase.js';

/**
 * Busca o documento do usuário em `users/{uid}`.
 * @param {string} uid
 * @returns {Promise<object | null>}
 */
export async function fetchUserDoc(uid) {
  const snap = await getDoc(doc(db, 'users', uid));
  return snap.exists() ? { ...snap.data(), id: snap.id } : null;
}

/**
 * Login: signIn + busca doc + avalia status.
 * Retorna { user, userData } ou lança erro com código semântico.
 */
export async function loginUser(email, password) {
  const cred = await signInWithEmailAndPassword(auth, email, password);
  const userData = await fetchUserDoc(cred.user.uid);

  // Conta sem doc no Firestore — não deveria acontecer, mas protege
  if (!userData) {
    await signOut(auth);
    throw new Error('USER_DOC_MISSING');
  }

  // Avalia status antes de permitir o acesso
  if (userData.status === 'pending') {
    await signOut(auth);
    throw new Error('STATUS_PENDING');
  }

  if (userData.status === 'rejected' || userData.status === 'disabled') {
    await signOut(auth);
    throw new Error('STATUS_BLOCKED');
  }

  // Atualiza lastLoginAt
  await updateDoc(doc(db, 'users', cred.user.uid), {
    lastLoginAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  return { user: cred.user, userData };
}

/**
 * Cadastro: cria conta Auth + doc users/{uid}, depois faz signOut.
 * O usuário nasce pending e não permanece logado.
 */
export async function signupUser(email, password) {
  const cred = await createUserWithEmailAndPassword(auth, email, password);

  await setDoc(doc(db, 'users', cred.user.uid), {
    email: email.toLowerCase().trim(),
    displayName: null,
    role: 'staff',
    status: 'pending',
    mustChangePassword: false,
    approvedAt: null,
    approvedBy: null,
    lastLoginAt: null,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
    createdBy: cred.user.uid,
    updatedBy: cred.user.uid,
  });

  await signOut(auth);
  return cred.user;
}

/**
 * Recuperação de senha: envia e-mail de reset via Firebase.
 * Nunca revela se o e-mail existe.
 */
export async function resetUserPassword(email) {
  try {
    await sendPasswordResetEmail(auth, email);
  } catch {
    // Silencia erros para não revelar se o e-mail existe (seção 8.3)
  }
}

/**
 * Define a senha definitiva (tela /definir-senha).
 * Atualiza a senha no Auth e marca mustChangePassword: false no doc.
 */
export async function setDefinitivePassword(newPassword) {
  const user = auth.currentUser;
  if (!user) throw new Error('NOT_AUTHENTICATED');

  await updatePassword(user, newPassword);

  await updateDoc(doc(db, 'users', user.uid), {
    mustChangePassword: false,
    updatedAt: serverTimestamp(),
    updatedBy: user.uid,
  });
}

/**
 * Atualiza o documento de um usuário.
 */
export async function updateUserDoc(uid, data) {
  await updateDoc(doc(db, 'users', uid), {
    ...data,
    updatedAt: serverTimestamp(),
    updatedBy: auth.currentUser?.uid ?? uid,
  });
}

/**
 * Logout.
 */
export async function logoutUser() {
  await signOut(auth);
}

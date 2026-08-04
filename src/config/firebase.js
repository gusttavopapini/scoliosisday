// src/config/firebase.js
// Firebase SDK v10+ (modular).
// As credenciais reais vêm das variáveis de ambiente VITE_FIREBASE_*.
// Quando VITE_USE_EMULATORS=true, conecta aos emulators locais.

import { initializeApp, deleteApp } from 'firebase/app';
import { getAuth, connectAuthEmulator } from 'firebase/auth';
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore';
import { getStorage, connectStorageEmulator } from 'firebase/storage';

const firebaseConfig = {
  apiKey:            import.meta.env.VITE_FIREBASE_API_KEY            ?? '',
  authDomain:        import.meta.env.VITE_FIREBASE_AUTH_DOMAIN        ?? '',
  projectId:         import.meta.env.VITE_FIREBASE_PROJECT_ID         ?? '',
  storageBucket:     import.meta.env.VITE_FIREBASE_STORAGE_BUCKET     ?? '',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID ?? '',
  appId:             import.meta.env.VITE_FIREBASE_APP_ID             ?? '',
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

// ── Emulators ──
// Conecta aos emulators locais quando VITE_USE_EMULATORS=true.
// Os emulators devem estar rodando: npm run emulators
const useEmulators = import.meta.env.VITE_USE_EMULATORS === 'true';

if (useEmulators) {
  connectAuthEmulator(auth, 'http://127.0.0.1:9099', { disableWarnings: true });
  connectFirestoreEmulator(db, '127.0.0.1', 8080);
  connectStorageEmulator(storage, '127.0.0.1', 9199);

  console.info('[Firebase] Conectado aos emulators locais.');
}

/**
 * Cria uma instância Auth isolada, em um app secundário.
 *
 * createUserWithEmailAndPassword autentica a conta recém-criada na instância
 * em que roda. No app principal isso derrubaria a sessão do admin — por isso
 * a criação de membros (seção 11.6) acontece aqui, em separado.
 *
 * Quem chama é responsável por chamar destroySecondaryAuth ao terminar.
 * @returns {{ secondaryApp: import('firebase/app').FirebaseApp, secondaryAuth: import('firebase/auth').Auth }}
 */
export function createSecondaryAuth() {
  const secondaryApp = initializeApp(firebaseConfig, `secondary-${Date.now()}`);
  const secondaryAuth = getAuth(secondaryApp);

  if (useEmulators) {
    connectAuthEmulator(secondaryAuth, 'http://127.0.0.1:9099', { disableWarnings: true });
  }

  return { secondaryApp, secondaryAuth };
}

/** Descarta o app secundário criado por createSecondaryAuth. */
export async function destroySecondaryAuth(secondaryApp) {
  await deleteApp(secondaryApp);
}

export { app, auth, db, storage };

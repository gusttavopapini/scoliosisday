#!/usr/bin/env node

// functions/scripts/purgeOrphanAuthUsers.js
// ──────────────────────────────────────────────────────────────────
// Remove do Firebase Auth as contas que não têm mais documento em users/.
//
// ── POR QUE ESTE SCRIPT EXISTE ──
//
// Excluir um membro pelo painel apaga users/{uid}, mas não a conta no Auth:
// o SDK cliente não remove a conta de terceiros, isso exige o Admin SDK.
// A conta órfã continua ocupando o e-mail, e recadastrar a mesma pessoa
// falha com "auth/email-already-exists".
//
// A correção definitiva é a Cloud Function onStaffDeleted (functions/index.js),
// que faz isso automaticamente. Ela exige o plano Blaze — enquanto o projeto
// estiver no Spark, este script cobre o mesmo caso, rodado à mão.
//
// ── USO ──
//
//   node functions/scripts/purgeOrphanAuthUsers.js            # auditoria
//   node functions/scripts/purgeOrphanAuthUsers.js --apply    # remove
//
// Ou, pelos atalhos do package.json:
//
//   npm run audit:orphans
//   npm run purge:orphans
//
// ── COM EMULATORS ──
//
//   FIRESTORE_EMULATOR_HOST=127.0.0.1:8080 \
//   FIREBASE_AUTH_EMULATOR_HOST=127.0.0.1:9099 \
//   node functions/scripts/purgeOrphanAuthUsers.js --apply
//
// ── PROTEÇÕES ──
//
// - Nunca remove uma conta cujo custom claim seja role === 'admin', mesmo que
//   o documento dela tenha sumido. Perder o documento do admin é recuperável;
//   perder a conta dele, não.
// - Sem --apply, nada é gravado.
// ──────────────────────────────────────────────────────────────────

import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { initializeApp, cert } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';

const __dirname = dirname(fileURLToPath(import.meta.url));

const APPLY = process.argv.includes('--apply');

/** Páginas de listUsers: o Admin SDK devolve no máximo 1000 por vez. */
const PAGE_SIZE = 1000;

// ── Inicialização ──
if (process.env.FIRESTORE_EMULATOR_HOST) {
  initializeApp({ projectId: 'scoliosisday-dev' });
  console.info('🔧 Conectado aos emulators locais.\n');
} else {
  const keyPath = resolve(__dirname, 'service-account-key.json');
  let serviceAccount;
  try {
    serviceAccount = JSON.parse(readFileSync(keyPath, 'utf-8'));
  } catch {
    console.error(`\n❌ Service Account não encontrada: ${keyPath}\n`);
    process.exit(1);
  }
  initializeApp({ credential: cert(serviceAccount) });
}

const auth = getAuth();
const db = getFirestore();

/** Todos os uids que ainda têm documento em users/. */
async function fetchUserDocIds() {
  const snapshot = await db.collection('users').get();
  return new Map(snapshot.docs.map((snap) => [snap.id, snap.data()]));
}

/** Percorre todas as páginas de contas do Auth. */
async function fetchAllAuthUsers() {
  const users = [];
  let pageToken;
  do {
    const result = await auth.listUsers(PAGE_SIZE, pageToken);
    users.push(...result.users);
    pageToken = result.pageToken;
  } while (pageToken);
  return users;
}

const [docs, authUsers] = await Promise.all([fetchUserDocIds(), fetchAllAuthUsers()]);

const orphans = [];
const protectedAdmins = [];
const missingClaims = [];

for (const user of authUsers) {
  const claims = user.customClaims ?? {};
  const doc = docs.get(user.uid);

  if (!doc) {
    // Conta sem documento. O admin fica de fora por segurança.
    if (claims.role === 'admin') {
      protectedAdmins.push(user);
      continue;
    }
    orphans.push(user);
    continue;
  }

  // Diagnóstico à parte: a conta existe e tem documento, mas os claims que
  // as Security Rules exigem (role/status) não estão lá — esse usuário é
  // negado em todas as coleções até syncUserClaims rodar.
  if (claims.role !== doc.role || claims.status !== doc.status) {
    missingClaims.push({
      Email: user.email ?? '(sem e-mail)',
      'Documento (role/status)': `${doc.role ?? '—'} / ${doc.status ?? '—'}`,
      'Claims (role/status)': `${claims.role ?? '—'} / ${claims.status ?? '—'}`,
    });
  }
}

console.info(APPLY ? '── REMOÇÃO ──\n' : '── AUDITORIA (nada será removido) ──\n');
console.info(`Contas no Auth: ${authUsers.length}   Documentos em users/: ${docs.size}\n`);

if (protectedAdmins.length > 0) {
  console.info('🛡  Admin sem documento — preservado por segurança:');
  for (const user of protectedAdmins) {
    console.info(`   ${user.email ?? user.uid}`);
  }
  console.info('');
}

if (missingClaims.length > 0) {
  console.info('⚠️  Contas cujos custom claims não batem com o documento.');
  console.info('   As Security Rules leem claims().role e claims().status —');
  console.info('   enquanto divergirem, o painel nega acesso a esses usuários.');
  console.info('   Some quando a Cloud Function syncUserClaims for deployada.\n');
  console.table(missingClaims);
  console.info('');
}

if (orphans.length === 0) {
  console.info('✓ Nenhuma conta órfã. Todo e-mail excluído pelo painel pode ser recadastrado.\n');
  process.exit(0);
}

console.info('🗑  Contas órfãs (sem documento em users/):');
console.table(
  orphans.map((user) => ({
    Email: user.email ?? '(sem e-mail)',
    UID: user.uid,
    Criada: user.metadata.creationTime,
  })),
);

if (!APPLY) {
  console.info(`\n⚠️  ${orphans.length} conta(s) órfã(s). Esses e-mails não podem ser recadastrados.`);
  console.info('   Rode novamente com --apply para removê-las do Auth.\n');
  process.exit(0);
}

// deleteUsers aceita até 1000 uids por chamada.
const result = await auth.deleteUsers(orphans.map((user) => user.uid));

console.info(`\n✅ ${result.successCount} conta(s) removida(s) do Auth.`);
if (result.failureCount > 0) {
  console.error(`❌ ${result.failureCount} falha(s):`);
  for (const err of result.errors) {
    console.error(`   ${orphans[err.index]?.email ?? err.index}: ${err.error.message}`);
  }
  process.exit(1);
}
console.info('   Esses e-mails já podem ser cadastrados de novo.\n');
process.exit(0);

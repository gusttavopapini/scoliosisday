#!/usr/bin/env node

// functions/scripts/seedAdmin.js
// ──────────────────────────────────────────────────────────────────
// Script de seed para criar o ÚNICO perfil admin do painel.
// Executar UMA VEZ, em ambiente controlado, após configurar o Firebase.
//
// ── PRÉ-REQUISITOS ──
//
// 1. Instale o firebase-admin:
//    npm install --save-dev firebase-admin
//
// 2. Gere a Service Account Key:
//    a) Acesse o Firebase Console → ⚙️ Configurações → Contas de serviço
//    b) Clique em "Gerar nova chave privada"
//    c) Salve o arquivo JSON como:
//       functions/scripts/service-account-key.json
//
//    ⚠️  NUNCA commite esse arquivo!
//    Ele está (e deve estar) no .gitignore.
//    Se não estiver, adicione:
//       functions/scripts/service-account-key.json
//
// 3. Certifique-se de que o projeto Firebase tem Auth e Firestore habilitados.
//
// ── USO ──
//
//   node functions/scripts/seedAdmin.js <email> <senha>
//
// Exemplo:
//   node functions/scripts/seedAdmin.js admin@scoliosisday.com.br MinhaSenh@123
//
// ── COM EMULATORS ──
//
// Para popular o emulator local em vez do projeto real:
//
//   FIRESTORE_EMULATOR_HOST=127.0.0.1:8080 \
//   FIREBASE_AUTH_EMULATOR_HOST=127.0.0.1:9099 \
//   node functions/scripts/seedAdmin.js admin@scoliosisday.com.br MinhaSenh@123
//
// Os emulators devem estar rodando (npm run emulators) antes de executar.
//
// ── O QUE ESTE SCRIPT FAZ ──
//
// 1. Cria um usuário no Firebase Auth com o e-mail e senha fornecidos.
// 2. Define custom claims { role: 'admin', status: 'approved' }.
// 3. Cria o documento users/{uid} com:
//    - role: 'admin'
//    - status: 'approved'
//    - mustChangePassword: false
//    - timestamps de criação
// 4. Exibe o UID criado no console.
//
// ── SEGURANÇA ──
//
// - Existe UM ÚNICO admin. Nunca execute este script duas vezes.
// - Nenhuma operação do painel cria um segundo admin, rebaixa o admin
//   existente, nem permite que ele exclua a si mesmo (seção 8.5).
// ──────────────────────────────────────────────────────────────────

import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { initializeApp, cert } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';

const __dirname = dirname(fileURLToPath(import.meta.url));

// ── Argumentos ──
const [,, email, password] = process.argv;

if (!email || !password) {
  console.error('\n❌ Uso: node functions/scripts/seedAdmin.js <email> <senha>\n');
  console.error('Exemplo: node functions/scripts/seedAdmin.js admin@scoliosisday.com.br MinhaSenh@123\n');
  process.exit(1);
}

// ── Inicialização ──
// Se os emulators estiverem configurados via variáveis de ambiente,
// o Admin SDK se conecta automaticamente a eles.
const useEmulator = !!process.env.FIRESTORE_EMULATOR_HOST;

if (useEmulator) {
  // Com emulators, não precisa de service account
  initializeApp({ projectId: 'scoliosisday-dev' });
  console.info('🔧 Conectado aos emulators locais.\n');
} else {
  // Produção: carrega a service account key
  const keyPath = resolve(__dirname, 'service-account-key.json');
  let serviceAccount;
  try {
    serviceAccount = JSON.parse(readFileSync(keyPath, 'utf-8'));
  } catch {
    console.error('\n❌ Arquivo de Service Account não encontrado:');
    console.error(`   ${keyPath}\n`);
    console.error('Para gerar a chave:');
    console.error('  1. Firebase Console → ⚙️ Configurações → Contas de serviço');
    console.error('  2. "Gerar nova chave privada"');
    console.error(`  3. Salve como: ${keyPath}\n`);
    process.exit(1);
  }

  initializeApp({ credential: cert(serviceAccount) });
}

const authAdmin = getAuth();
const dbAdmin = getFirestore();

// ── Criação do admin ──
try {
  // 1. Criar o usuário no Auth
  const userRecord = await authAdmin.createUser({
    email,
    password,
    displayName: 'Administrador',
  });
  console.info(`✅ Usuário criado no Auth: ${userRecord.uid}`);

  // 2. Definir custom claims
  await authAdmin.setCustomUserClaims(userRecord.uid, {
    role: 'admin',
    status: 'approved',
  });
  console.info('✅ Custom claims definidos: { role: admin, status: approved }');

  // 3. Criar documento em users/{uid}
  const now = FieldValue.serverTimestamp();
  await dbAdmin.doc(`users/${userRecord.uid}`).set({
    email: email.toLowerCase().trim(),
    displayName: 'Administrador',
    role: 'admin',
    status: 'approved',
    mustChangePassword: false,
    approvedAt: now,
    approvedBy: userRecord.uid,
    lastLoginAt: null,
    createdAt: now,
    updatedAt: now,
    createdBy: userRecord.uid,
    updatedBy: userRecord.uid,
  });
  console.info(`✅ Documento users/${userRecord.uid} criado no Firestore`);

  console.info('\n🎉 Admin seed completo!\n');
  console.info(`   E-mail:  ${email}`);
  console.info(`   UID:     ${userRecord.uid}`);
  console.info(`   Role:    admin`);
  console.info(`   Status:  approved\n`);

  process.exit(0);
} catch (err) {
  if (err.code === 'auth/email-already-exists') {
    console.error(`\n❌ O e-mail "${email}" já existe no Firebase Auth.`);
    console.error('   O admin já foi criado anteriormente.\n');
  } else {
    console.error('\n❌ Erro ao criar admin:', err.message, '\n');
  }
  process.exit(1);
}

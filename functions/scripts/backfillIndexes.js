#!/usr/bin/env node

// functions/scripts/backfillIndexes.js
// ──────────────────────────────────────────────────────────────────
// Migração exigida pela mudança de queries (orderBy + where).
//
// ── POR QUE ──
//
// 1. `createdAt` ausente
//    As listagens passaram a usar orderBy('createdAt', 'desc'). No Firestore,
//    um documento que NÃO tem o campo do orderBy simplesmente não aparece no
//    resultado — não é erro, é omissão silenciosa. Qualquer documento gravado
//    antes desta migração sem createdAt sumiria do painel.
//
// 2. `programmings.speakerIds` ausente
//    integrity.js deixou de varrer a coleção e passou a consultar
//    where('speakerIds', 'array-contains', id). Sem o campo, a checagem de
//    "colaborador em uso" devolve vazio e libera uma exclusão que deveria
//    ser bloqueada — deixando sessões apontando para um doc inexistente.
//
// ── USO ──
//
//   node functions/scripts/backfillIndexes.js            # auditoria (não grava)
//   node functions/scripts/backfillIndexes.js --apply    # grava as correções
//
// Rode SEMPRE a auditoria primeiro e leia o relatório.
//
// ── COM EMULATORS ──
//
//   FIRESTORE_EMULATOR_HOST=127.0.0.1:8080 \
//   node functions/scripts/backfillIndexes.js --apply
//
// ── O QUE GRAVA (com --apply) ──
//
// - createdAt: preenchido com updatedAt quando existir, senão com o instante
//   da migração. Nunca sobrescreve um createdAt já presente.
// - updatedAt: preenchido apenas em events, que ordena os recentes por ele.
// - speakerIds: recalculado a partir de sessions[].speakers.
// ──────────────────────────────────────────────────────────────────

import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore, Timestamp } from 'firebase-admin/firestore';

const __dirname = dirname(fileURLToPath(import.meta.url));

const APPLY = process.argv.includes('--apply');

/** Coleções ordenadas por createdAt nas listagens. */
const COLLECTIONS = ['events', 'collaborators', 'sponsors', 'programmings', 'users'];

/** Firestore limita um writeBatch a 500 operações. */
const BATCH_LIMIT = 500;

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

const db = getFirestore();

/** Grava as atualizações em lotes de até 500. */
async function commitInBatches(writes) {
  for (let i = 0; i < writes.length; i += BATCH_LIMIT) {
    const batch = db.batch();
    for (const { ref, data } of writes.slice(i, i + BATCH_LIMIT)) {
      batch.set(ref, data, { merge: true });
    }
    await batch.commit();
  }
}

/** Achata sessions[].speakers em ids únicos. */
function collectSpeakerIds(sessions) {
  return [...new Set((sessions ?? []).flatMap((session) => session.speakers ?? []))];
}

const now = Timestamp.now();
const writes = [];
const report = [];

for (const name of COLLECTIONS) {
  const snapshot = await db.collection(name).get();

  let missingCreatedAt = 0;
  let missingUpdatedAt = 0;
  let missingSpeakerIds = 0;

  for (const docSnap of snapshot.docs) {
    const data = docSnap.data();
    const patch = {};

    if (!data.createdAt) {
      patch.createdAt = data.updatedAt ?? now;
      missingCreatedAt++;
    }

    // Só events ordena por updatedAt (os "recentes" do dashboard).
    if (name === 'events' && !data.updatedAt) {
      patch.updatedAt = data.createdAt ?? now;
      missingUpdatedAt++;
    }

    if (name === 'programmings') {
      const derived = collectSpeakerIds(data.sessions);
      const current = data.speakerIds;
      const isStale =
        !Array.isArray(current) ||
        current.length !== derived.length ||
        derived.some((id) => !current.includes(id));

      if (isStale) {
        patch.speakerIds = derived;
        missingSpeakerIds++;
      }
    }

    if (Object.keys(patch).length > 0) {
      writes.push({ ref: docSnap.ref, data: patch });
    }
  }

  report.push({
    Coleção: name,
    Documentos: snapshot.size,
    'sem createdAt': missingCreatedAt,
    'sem updatedAt': name === 'events' ? missingUpdatedAt : '—',
    'speakerIds desatualizado': name === 'programmings' ? missingSpeakerIds : '—',
  });
}

console.info(APPLY ? '── MIGRAÇÃO ──\n' : '── AUDITORIA (nada será gravado) ──\n');
console.table(report);

if (writes.length === 0) {
  console.info('\n✓ Nada a corrigir. As queries com orderBy vão enxergar todos os documentos.\n');
  process.exit(0);
}

if (!APPLY) {
  console.info(`\n⚠️  ${writes.length} documento(s) precisam de correção.`);
  console.info('   Sem ela, esses documentos NÃO aparecerão nas listagens do painel.');
  console.info('   Rode novamente com --apply para gravar.\n');
  process.exit(0);
}

await commitInBatches(writes);
console.info(`\n✅ ${writes.length} documento(s) corrigidos.\n`);
process.exit(0);

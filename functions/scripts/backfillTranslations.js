#!/usr/bin/env node

// functions/scripts/backfillTranslations.js
// ──────────────────────────────────────────────────────────────────
// Retroação da tradução para inglês dos registros ANTIGOS.
//
// ── POR QUE ──
//
// As coleções `testimonials` e `collaborators` só entraram no fluxo de
// tradução ao salvar depois que já existiam registros. Esses documentos
// não têm campo `_en` nenhum, então o site em inglês cai no texto em
// português (fallback de hooks/useStoredTranslation.js). Só um novo save
// no painel os corrigiria — este script faz isso em lote.
//
// ── O QUE GRAVA ──
//
//   testimonials  → quote_en, role_en        (texto puro)
//   collaborators → curriculum_en            (HTML do editor rico)
//
// NUNCA toca no conteúdo em português. NUNCA remove ou sobrescreve
// qualquer outro campo: cada escrita é um update com APENAS as chaves
// `_en` pendentes daquele documento.
//
// Nomes NÃO entram aqui. "Dra." → "Dr." é conversão local feita na
// leitura (utils/honorifics.js) e já vale para todos os registros, sem
// migração. Dentro dos textos, a conversão vem junto da tradução.
//
// ── USO ──
//
//   node functions/scripts/backfillTranslations.js             # dry-run (padrão)
//   node functions/scripts/backfillTranslations.js --apply     # grava
//
//   --delay=<ms>   pausa entre chamadas de API (padrão 1500)
//   --limit=<n>    processa no máximo n documentos (para um --apply cauteloso)
//   --reset        ignora o arquivo de progresso e recomeça a contagem
//
// O DRY-RUN NÃO GRAVA NADA, mas faz um punhado de chamadas de API para
// mostrar amostras de tradução de verdade — é o ponto de conferir a
// qualidade antes de autorizar a escrita.
//
// ── COM EMULATORS ──
//
//   FIRESTORE_EMULATOR_HOST=127.0.0.1:8080 \
//   node functions/scripts/backfillTranslations.js --apply
// ──────────────────────────────────────────────────────────────────

import { readFileSync, writeFileSync, existsSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { DOMParser as LinkeDOMParser } from 'linkedom';

const __dirname = dirname(fileURLToPath(import.meta.url));

const APPLY = process.argv.includes('--apply');
const RESET = process.argv.includes('--reset');
const argOf = (name, fallback) => {
  const hit = process.argv.find((a) => a.startsWith(`--${name}=`));
  return hit ? Number(hit.split('=')[1]) : fallback;
};
const DELAY_MS = argOf('delay', 1500);
const LIMIT = argOf('limit', Infinity);

/** Quantas falhas seguidas já contam como cota estourada (e não azar
 *  isolado). Nesse ponto o script para em vez de gravar null em massa. */
const CONSECUTIVE_FAILURE_LIMIT = 3;

/** Quantos registros têm a tradução exibida como amostra no dry-run. */
const SAMPLE_SIZE = 3;

const PROGRESS_FILE = resolve(__dirname, '.backfill-translations-progress.json');
const backupFile = () =>
  resolve(__dirname, `.backfill-translations-backup-${new Date().toISOString().replace(/[:.]/g, '-')}.json`);

// ── DOM para o tradutor de HTML ────────────────────────────────────
//
// translateHtmlForStorage usa DOMParser, que existe no browser (onde o
// painel roda) mas não em Node. O linkedom entra só aqui, como
// devDependency de functions/ — não vai para o bundle do site.
//
// O wrapper de <html><body> é necessário: sem ele o linkedom coloca o
// fragmento em documentElement e deixa document.body VAZIO, e o tradutor
// não acharia nó de texto nenhum (devolvia null para todo currículo).
globalThis.DOMParser = class {
  parseFromString(html, type) {
    return new LinkeDOMParser().parseFromString(`<html><body>${html}</body></html>`, type);
  }
};

// Import dinâmico: só depois do shim acima estar no lugar.
const { translatePlainForStorage, translateHtmlForStorage, splitIntoChunks, collectTextNodes } =
  await import('../../src/utils/translateForStorage.js');

// ── Escopo ─────────────────────────────────────────────────────────
//
// Espelha os campos declarados em services/testimonials.js e
// services/collaborators.js. Mudar lá exige mudar aqui.
const TARGETS = [
  { collection: 'testimonials', fields: ['quote', 'role'], kind: 'plain' },
  { collection: 'collaborators', fields: ['curriculum'], kind: 'html' },
];

const translatorFor = (kind) => (kind === 'html' ? translateHtmlForStorage : translatePlainForStorage);

// ── Inicialização ──────────────────────────────────────────────────
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
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/**
 * Quantas requisições à API um campo vai custar. Usa as MESMAS funções do
 * tradutor (splitIntoChunks/collectTextNodes), não uma estimativa paralela
 * que poderia divergir do que a execução real faz.
 */
function countRequests(value, kind) {
  if (kind === 'plain') return splitIntoChunks(value).length;
  const doc = new DOMParser().parseFromString(value, 'text/html');
  return collectTextNodes(doc.body).reduce(
    (total, node) => total + splitIntoChunks(node.nodeValue.trim()).length,
    0,
  );
}

/**
 * Um campo está pendente quando tem texto em português e NÃO tem uma
 * tradução aproveitável gravada.
 *
 * Nota sobre idempotência: o fluxo de save pula quando a chave `_en`
 * apenas EXISTE, mesmo valendo null. Aqui, null conta como pendente de
 * propósito — null é o registro de uma tentativa que falhou, e é o que
 * permite rodar o script de novo depois para recuperar o que a cota
 * derrubou. Já traduzido (string não vazia) nunca é retraduzido, então
 * rodar duas vezes seguidas não gera chamada nenhuma.
 */
function pendingFields(data, fields) {
  return fields.filter((field) => {
    const source = data[field];
    if (typeof source !== 'string' || !source.trim()) return false;
    const existing = data[`${field}_en`];
    return !(typeof existing === 'string' && existing.trim());
  });
}

// ── Levantamento ───────────────────────────────────────────────────
const progress = !RESET && existsSync(PROGRESS_FILE)
  ? JSON.parse(readFileSync(PROGRESS_FILE, 'utf-8'))
  : { done: [], failures: [] };
const alreadyDone = new Set(progress.done);

const plan = [];
let skippedTranslated = 0;
let skippedEmpty = 0;

for (const target of TARGETS) {
  const snapshot = await db.collection(target.collection).get();

  for (const snap of snapshot.docs) {
    const data = snap.data();
    const pending = pendingFields(data, target.fields);

    if (pending.length === 0) {
      const hasAnySource = target.fields.some((f) => typeof data[f] === 'string' && data[f].trim());
      if (hasAnySource) skippedTranslated += 1;
      else skippedEmpty += 1;
      continue;
    }
    if (alreadyDone.has(`${target.collection}/${snap.id}`)) continue;

    plan.push({
      collection: target.collection,
      kind: target.kind,
      id: snap.id,
      ref: snap.ref,
      data,
      fields: pending,
      requests: pending.reduce((t, f) => t + countRequests(data[f], target.kind), 0),
      label: data.name || data.fullName || snap.id,
    });
  }
}

const totalRequests = plan.reduce((t, item) => t + item.requests, 0);

// ── Relatório ──────────────────────────────────────────────────────
console.info('═'.repeat(64));
console.info(APPLY ? '  RETROAÇÃO DE TRADUÇÃO — MODO --apply (GRAVA)' : '  RETROAÇÃO DE TRADUÇÃO — DRY-RUN (não grava nada)');
console.info('═'.repeat(64));

for (const target of TARGETS) {
  const items = plan.filter((i) => i.collection === target.collection);
  console.info(`\n▸ ${target.collection} — ${items.length} documento(s) a traduzir`);
  for (const item of items) {
    console.info(`    ${item.id}  ${item.fields.join(', ')}  (${item.requests} req)  ${item.label}`);
  }
  if (items.length === 0) console.info('    (nada pendente)');
}

const minutes = Math.ceil((totalRequests * DELAY_MS) / 60000);
console.info(`\n${'─'.repeat(64)}`);
console.info(`  Documentos a processar ........ ${plan.length}`);
console.info(`  Chamadas de API no total ...... ${totalRequests}`);
console.info(`  Pausa entre chamadas .......... ${DELAY_MS}ms`);
console.info(`  Tempo estimado ................ ~${minutes} min`);
console.info(`  Pulados (já traduzidos) ....... ${skippedTranslated}`);
console.info(`  Pulados (sem texto de origem) . ${skippedEmpty}`);
if (alreadyDone.size) console.info(`  Pulados (progresso anterior) .. ${alreadyDone.size}`);
console.info('─'.repeat(64));

// ── Dry-run: amostras reais ────────────────────────────────────────
if (!APPLY) {
  if (plan.length === 0) {
    console.info('\n✅ Nada pendente. Nenhuma escrita seria feita.\n');
    process.exit(0);
  }

  console.info(`\n🔍 Amostra de tradução de até ${SAMPLE_SIZE} registro(s) — chamadas reais à API, SEM gravar:\n`);

  for (const item of plan.slice(0, SAMPLE_SIZE)) {
    const field = item.fields[0];
    const source = item.data[field];
    console.info('─'.repeat(64));
    console.info(`${item.collection}/${item.id} · campo "${field}" · ${item.label}`);
    console.info(`\n  PT: ${source.slice(0, 400)}${source.length > 400 ? '…' : ''}`);
    const translated = await translatorFor(item.kind)(source);
    console.info(`\n  EN: ${translated ? translated.slice(0, 400) + (translated.length > 400 ? '…' : '') : '⚠️  falhou (gravaria null)'}\n`);
    await sleep(DELAY_MS);
  }

  console.info('═'.repeat(64));
  console.info('  DRY-RUN concluído. Nada foi gravado.');
  console.info('  Para gravar: node functions/scripts/backfillTranslations.js --apply');
  console.info('═'.repeat(64) + '\n');
  process.exit(0);
}

// ── Apply ──────────────────────────────────────────────────────────
if (plan.length === 0) {
  console.info('\n✅ Nada pendente. Nenhuma escrita feita.\n');
  process.exit(0);
}

// Backup ANTES de qualquer escrita: documentos afetados, na íntegra.
const backupPath = backupFile();
writeFileSync(
  backupPath,
  JSON.stringify(
    plan.map(({ collection, id, data }) => ({ collection, id, data })),
    null,
    2,
  ),
);
console.info(`\n💾 Backup dos documentos afetados: ${backupPath}\n`);

const failures = [...progress.failures];
let consecutiveFailures = 0;
let written = 0;
let nulls = 0;
let stoppedAt = null;

outer: for (const item of plan.slice(0, LIMIT)) {
  const update = {};
  // Um documento só entra no progresso se TODOS os campos dele traduziram.
  // Sem isto, um documento que gravou null seria marcado como concluído e a
  // execução seguinte o PULARIA — o null nunca seria recuperado, que é o
  // contrário do motivo de null contar como pendente em pendingFields().
  let docHadFailure = false;

  for (const field of item.fields) {
    const translated = await translatorFor(item.kind)(item.data[field]);

    if (translated) {
      consecutiveFailures = 0;
    } else {
      consecutiveFailures += 1;
      docHadFailure = true;
      nulls += 1;
      failures.push({ collection: item.collection, id: item.id, field });
      console.warn(`  ⚠️  ${item.collection}/${item.id} · ${field} → null`);
    }

    // null é gravado de propósito: marca "tentado e falhou", distinto de
    // "nunca tentado", e o site continua caindo no português.
    update[`${field}_en`] = translated;

    if (consecutiveFailures >= CONSECUTIVE_FAILURE_LIMIT) {
      stoppedAt = `${item.collection}/${item.id}`;
      // Grava o que já foi resolvido deste documento antes de sair.
      await item.ref.update(update);
      break outer;
    }

    await sleep(DELAY_MS);
  }

  // update com APENAS as chaves `_en`: nenhum outro campo é tocado.
  await item.ref.update(update);
  written += 1;
  if (!docHadFailure) progress.done.push(`${item.collection}/${item.id}`);
  progress.failures = failures;
  writeFileSync(PROGRESS_FILE, JSON.stringify(progress, null, 2));
  console.info(`  ✓ ${item.collection}/${item.id} · ${Object.keys(update).join(', ')}`);
}

progress.failures = failures;
writeFileSync(PROGRESS_FILE, JSON.stringify(progress, null, 2));

console.info(`\n${'═'.repeat(64)}`);
if (stoppedAt) {
  console.info(`  ⛔ PARADO em ${stoppedAt} após ${CONSECUTIVE_FAILURE_LIMIT} falhas seguidas.`);
  console.info('     Provável cota da MyMemory estourada. Rode de novo amanhã:');
  console.info('     o script retoma exatamente de onde parou.');
} else {
  console.info('  ✅ Concluído.');
}
console.info(`  Documentos gravados ........... ${written}`);
console.info(`  Campos gravados como null ..... ${nulls}`);
if (failures.length) {
  console.info('\n  Campos que ficaram sem tradução (rode de novo para recuperar):');
  for (const f of failures) console.info(`    ${f.collection}/${f.id} · ${f.field}`);
}
console.info(`\n  Backup .......... ${backupPath}`);
console.info(`  Progresso ....... ${PROGRESS_FILE}`);
console.info('═'.repeat(64) + '\n');

// functions/index.js
// Cloud Functions para Scoliosis Day.
//
// API v2 (firebase-functions/v2). A v1 (`functions.firestore.document(...)`)
// não existe mais na raiz do pacote a partir do firebase-functions 6 — a raiz
// passou a exportar a v2, e o código antigo quebraria na análise do deploy.

import { onDocumentWritten, onDocumentDeleted } from 'firebase-functions/v2/firestore';
import { defineSecret } from 'firebase-functions/params';
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


/**
 * URL do Deploy Hook da Vercel do projeto "scoliosisday" (o que serve
 * scoliosisday.com — NÃO o "scoliosisday-zxlg", travado num rollback).
 *
 * Em Secret Manager, e não em variável de ambiente nem no código, porque
 * quem tem esta URL dispara builds à vontade: é um POST sem autenticação
 * nenhuma. Em texto no repositório ou no bundle do painel, viraria um
 * gatilho público de consumo de minutos de build.
 *
 * Cadastrar antes do primeiro deploy:
 *   firebase functions:secrets:set VERCEL_DEPLOY_HOOK_URL
 */
const VERCEL_DEPLOY_HOOK_URL = defineSecret('VERCEL_DEPLOY_HOOK_URL');

/**
 * onSeoSettingsWritten
 * Republica o site quando a imagem de preview de link (og:image) muda.
 *
 * Por que existe: crawlers de preview (WhatsApp, Facebook, LinkedIn,
 * Google) não executam JavaScript, então a og:image precisa estar no HTML
 * da primeira resposta. Nesta arquitetura quem a escreve é o build
 * (scripts/prerender-seo.mjs, que lê settings/seo). Sem um rebuild, trocar
 * a imagem no painel não mudaria nada para quem compartilha o link.
 *
 * O DISPARO É CONDICIONAL, e essa é a parte que mais importa aqui: só
 * quando ogImage.version muda de fato. O documento settings/seo é gravado
 * inteiro a cada salvamento do painel, e vai crescer (ogTitle/ogDescription
 * estão planejados) — reagir a "houve escrita" faria cada ajuste de texto,
 * cada gravação repetida e cada reexecução do gatilho queimar minutos de
 * build. A versão só muda quando a IMAGEM muda, que é exatamente o
 * critério certo.
 *
 * Remover a imagem também conta: version vai de uma string para null, o
 * que é uma mudança, e o rebuild devolve o site ao og-image.png estático.
 */
export const onSeoSettingsWritten = onDocumentWritten(
  { document: 'settings/seo', secrets: [VERCEL_DEPLOY_HOOK_URL] },
  async (event) => {
    const before = event.data?.before?.data()?.ogImage?.version ?? null;
    const after = event.data?.after?.data()?.ogImage?.version ?? null;

    if (before === after) {
      logger.info(`Versão da og:image inalterada (${after ?? 'nenhuma'}) — sem rebuild.`);
      return;
    }

    const hookUrl = VERCEL_DEPLOY_HOOK_URL.value();
    if (!hookUrl) {
      logger.error('VERCEL_DEPLOY_HOOK_URL não configurado — rebuild não disparado.');
      return;
    }

    logger.info(`og:image mudou (${before ?? 'nenhuma'} -> ${after ?? 'nenhuma'}) — disparando rebuild.`);

    try {
      const response = await fetch(hookUrl, { method: 'POST' });
      if (!response.ok) {
        throw new Error(`Deploy Hook respondeu HTTP ${response.status}`);
      }
      logger.info('Rebuild da Vercel disparado com sucesso.');
    } catch (error) {
      // Sem throw de propósito: o retry automático do gatilho reenviaria o
      // POST e enfileiraria builds duplicados. A imagem já está salva no
      // Firestore e o próximo deploy — por esta função ou por um push —
      // a publica de qualquer forma. Falhar aqui atrasa, não perde dado.
      logger.error('Falha ao disparar o Deploy Hook da Vercel.', error);
    }
  },
);

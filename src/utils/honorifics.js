// src/utils/honorifics.js
// "Dra." não existe em inglês: o pronome de tratamento é "Dr." para
// qualquer gênero. Este utilitário é a ÚNICA fonte dessa conversão, e
// roda exclusivamente no ramo em inglês do site — a versão em português
// nunca passa por aqui e continua com "Dra." normalmente.
//
// ── POR QUE UMA REGEX COM LIMITE DE PALAVRA DOS DOIS LADOS ────────────
//
// `\bDra` sozinho não serve: casa o começo de "Drama" e "Draco", e o
// texto viraria "Dr.ma". `Dra\b` sozinho também não: casa o fim de
// "Sandra", "quadra", "pedra", "Alexandra". Só com \b dos DOIS lados a
// palavra precisa estar isolada — que é exatamente o caso do pronome de
// tratamento e nunca o de um nome próprio que contenha essas letras.
//
// O ponto final entra como sufixo OPCIONAL depois do \b (em "Dra." o
// limite de palavra cai entre o "a" e o ponto), para "Dra." virar "Dr."
// e não "Dr..".

/** "Dra" isolada, com ponto opcional. Ver a explicação acima. */
const DRA_PATTERN = /\bDra\b\.?/gi;

/**
 * Decide a forma de saída preservando o estilo do original:
 *
 *   · "DRA." → "DR."   (caixa alta mantida — nome em versalete, título)
 *   · "Dra." → "Dr."
 *   · "dra." → "Dr."   capitalizado de propósito: em inglês o pronome de
 *                      tratamento é sempre capitular, e uma ocorrência
 *                      minúscula isolada em texto português é o mesmo
 *                      pronome escrito de forma relaxada.
 *
 * A PRESENÇA DO PONTO é preservada, não imposta: "Dra Ana" vira "Dr Ana",
 * não "Dr. Ana". Inserir pontuação que o autor não escreveu é uma
 * alteração de conteúdo, não uma normalização de idioma.
 */
function toEnglishForm(match) {
  const hasPeriod = match.endsWith('.');
  const letters = hasPeriod ? match.slice(0, -1) : match;
  const base = letters === letters.toUpperCase() ? 'DR' : 'Dr';
  return hasPeriod ? `${base}.` : base;
}

/**
 * Converte "Dra."/"Dra" para "Dr."/"Dr" em um texto que será exibido em
 * inglês. Qualquer outro conteúdo passa intacto.
 *
 * ATENÇÃO: recebe TEXTO PURO, nunca HTML. Numa string de HTML o limite de
 * palavra também casaria dentro de um atributo (um href do tipo
 * "/dra-fulana" tem limite antes do "d" e depois do "a"), corrompendo o
 * link. Currículo em HTML é tratado nó a nó em utils/translateForStorage.js,
 * onde só os nós de TEXTO chegam aqui.
 *
 * @param {string|null|undefined} text
 * @returns {string|null|undefined} O mesmo tipo que entrou, quando não é string.
 */
export function toEnglishHonorifics(text) {
  if (typeof text !== 'string') return text;
  return text.replace(DRA_PATTERN, toEnglishForm);
}

/**
 * Versão de exibição de um NOME conforme o idioma ativo.
 *
 * Função pura, não hook, de propósito: ScheduleSession.jsx resolve nomes
 * dentro de um `.map()` de palestrantes, onde a quantidade de chamadas
 * varia por sessão — um hook ali quebraria a regra dos hooks.
 *
 * Nomes NÃO passam pela API de tradução (nome próprio volta adulterado) e
 * portanto não têm campo `_en` no Firestore. Esta conversão é local e
 * síncrona, o que traz um efeito colateral desejável: vale imediatamente
 * para todos os colaboradores e depoimentos JÁ cadastrados, sem depender
 * de migração nenhuma.
 *
 * @param {string|null|undefined} name
 * @param {string} lang Valor de useLanguage() — 'pt-BR' ou 'en'.
 */
export function displayName(name, lang) {
  return lang === 'en' ? toEnglishHonorifics(name) : name;
}

// scripts/prerender-seo.mjs
// Pré-renderização de SEO — roda DEPOIS do `vite build`.
//
// O problema que resolve: crawlers de preview de link (WhatsApp,
// Facebook, LinkedIn, Discord, Slack, Telegram, X) não executam
// JavaScript. Num SPA, todas as rotas devolvem o MESMO index.html, então
// /sobre compartilhado no WhatsApp mostraria o preview da home.
//
// A solução aqui é a mais simples que resolve: para cada rota pública,
// grava uma cópia do index.html com as meta tags daquela rota trocadas.
// A Vercel serve /sobre/index.html para /sobre automaticamente (arquivo
// estático vence o rewrite de SPA), e o React assume dali em diante — o
// usuário vê exatamente a mesma aplicação de sempre.
//
// Não é cloaking: bot e usuário recebem o MESMO HTML, com as MESMAS meta
// tags. Não há detecção de user-agent em lugar nenhum.
//
// Sem dependência nova e sem headless browser: é substituição de texto
// sobre o HTML que o Vite já gerou. Por isso não quebra o build nem
// depende de o Chromium baixar em CI.
//
// Só rotas FIXAS, e isso basta: o site não tem rota dinâmica por edição
// — /edicoes alterna entre elas por abas, sem mudar a URL.
//
// ── Imagem de preview editável pelo painel ──────────────────────────────
//
// A og:image deixou de ser só o arquivo estático: o administrador pode
// trocá-la em /painel/redes-sociais, e o valor escolhido é lido AQUI, na
// hora do build, e assado no HTML das 5 rotas. É o que torna a troca
// visível para crawlers, que não executam JavaScript.
//
// O ciclo completo: admin salva -> Cloud Function detecta a mudança de
// versão (functions/index.js) -> dispara o Deploy Hook da Vercel -> este
// script roda de novo e lê o valor novo.
//
// A leitura usa a API REST do Firestore SEM credencial: o documento
// settings/seo é de leitura pública pela regra /settings/{id} do
// firestore.rules, mesma regra que já serve o rodapé a visitantes
// anônimos. Nada de service account em variável de ambiente de CI.

import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const DIST = join(ROOT, 'dist');
const SITE = 'https://scoliosisday.com';

// Imagem de preview padrão — o arquivo estático em public/. É o fallback
// em três situações: nenhuma imagem escolhida no painel, documento
// inexistente, ou falha de leitura do Firestore. Nas três, o resultado é
// exatamente o comportamento que o site já tinha.
const DEFAULT_OG_IMAGE = {
  url: `${SITE}/og-image.png`,
  type: 'image/png',
  width: 1200,
  height: 630,
};

const FIRESTORE_SEO_DOC =
  'https://firestore.googleapis.com/v1/projects/scoliosisday-9ebd4/databases/(default)/documents/settings/seo';

// Timeout curto e deliberado: este script está no caminho crítico do
// deploy. Se o Firestore não responder rápido, é melhor publicar com a
// imagem padrão do que travar a publicação inteira.
const FIRESTORE_TIMEOUT_MS = 8000;

/** Desembrulha o formato de valor da API REST do Firestore. */
function unwrap(field) {
  if (!field) return null;
  if ('stringValue' in field) return field.stringValue;
  if ('integerValue' in field) return Number(field.integerValue);
  if ('doubleValue' in field) return Number(field.doubleValue);
  if ('nullValue' in field) return null;
  return null;
}

/** Content-Type declarado em og:image:type, deduzido da extensão da URL. */
function imageTypeFromUrl(url) {
  const clean = url.split('?')[0].toLowerCase();
  if (clean.endsWith('.png')) return 'image/png';
  if (clean.endsWith('.webp')) return 'image/webp';
  if (clean.endsWith('.jpg') || clean.endsWith('.jpeg')) return 'image/jpeg';
  // URL do Storage não tem extensão no path quando vem com token; o tipo
  // real está no arquivo, e og:image:type é dica, não contrato.
  return 'image/png';
}

/**
 * Imagem de preview escolhida no painel, ou o padrão.
 *
 * NUNCA lança: qualquer falha (rede, timeout, documento ausente, resposta
 * inesperada) cai no arquivo estático e o build segue. Uma indisponibilidade
 * momentânea do Firestore não pode derrubar um deploy — o pior caso
 * aceitável é publicar com a imagem antiga, nunca não publicar.
 */
async function resolveOgImage() {
  try {
    const response = await fetch(FIRESTORE_SEO_DOC, {
      signal: AbortSignal.timeout(FIRESTORE_TIMEOUT_MS),
    });

    // 404 = documento nunca criado (nenhuma imagem foi escolhida ainda).
    // É estado normal, não erro: cai no padrão sem barulho de aviso.
    if (response.status === 404) {
      console.log('[seo] settings/seo não existe — usando a imagem padrão');
      return DEFAULT_OG_IMAGE;
    }
    if (!response.ok) throw new Error(`HTTP ${response.status}`);

    const body = await response.json();
    const ogImage = body?.fields?.ogImage?.mapValue?.fields;
    const url = unwrap(ogImage?.url);

    if (!url) {
      console.log('[seo] nenhuma imagem definida no painel — usando a imagem padrão');
      return DEFAULT_OG_IMAGE;
    }

    // A versão entra como querystring porque WhatsApp e Facebook guardam o
    // preview por URL, de forma agressiva: sem endereço novo, o card
    // continuaria servindo a miniatura antiga por dias.
    const version = unwrap(ogImage?.version);
    const separator = url.includes('?') ? '&' : '?';
    const versionedUrl = version ? `${url}${separator}v=${version}` : url;

    return {
      url: versionedUrl,
      type: imageTypeFromUrl(url),
      // Dimensões reais medidas no upload; sem elas, o par recomendado.
      width: unwrap(ogImage?.width) || DEFAULT_OG_IMAGE.width,
      height: unwrap(ogImage?.height) || DEFAULT_OG_IMAGE.height,
    };
  } catch (error) {
    console.warn(
      `[seo] falha ao ler settings/seo (${error.message}) — usando a imagem padrão. ` +
        'O build segue normalmente.',
    );
    return DEFAULT_OG_IMAGE;
  }
}

// Títulos e descrições vêm de texto que JÁ existe no site (heros e
// rodapé, ver src/i18n/pt-BR.js) — nada inventado aqui.
const ROUTES = [
  {
    path: '/edicoes',
    title: 'Edições — Scoliosis Day',
    description:
      'Todas as edições do Scoliosis Day: programação, palestrantes, valores e a história de cada encontro.',
  },
  {
    path: '/sobre',
    title: 'Sobre Nós — Scoliosis Day',
    description:
      'O maior encontro multidisciplinar sobre escoliose do Brasil. Ciência, prática clínica e alcance internacional.',
  },
  {
    path: '/hall-de-estrelas',
    title: 'Hall de Estrelas — Scoliosis Day',
    description: 'Grandes referências mundiais da escoliose reunidas no Scoliosis Day.',
  },
  {
    path: '/patrocinadores',
    title: 'Patrocinadores — Scoliosis Day',
    description: 'Grandes marcas que fazem parte da história do Scoliosis Day.',
  },
];

const ogImage = await resolveOgImage();
console.log(`[seo] og:image -> ${ogImage.url}`);

/**
 * Aplica a imagem de preview a um HTML.
 *
 * Roda em TODAS as rotas, inclusive na home — este era o buraco de antes:
 * o script não tocava em og:image, então as 5 páginas ficavam presas ao
 * arquivo estático do index.html mesmo depois de o painel ganhar o campo.
 *
 * og:image:alt fica de fora de propósito: o texto alternativo é da marca
 * ("Scoliosis Day"), não do arquivo, e continua valendo qualquer que seja a
 * imagem. Também ficam de fora, por decisão de escopo, o apple-touch-icon
 * e o `logo` do JSON-LD Organization: os dois são ícone e logo da MARCA, e
 * seguem apontando para o arquivo estático.
 */
function applyOgImage(source) {
  let out = metaTag(source, 'property', 'og:image', ogImage.url);
  out = metaTag(out, 'property', 'og:image:type', ogImage.type);
  out = metaTag(out, 'property', 'og:image:width', String(ogImage.width));
  out = metaTag(out, 'property', 'og:image:height', String(ogImage.height));
  out = metaTag(out, 'name', 'twitter:image', ogImage.url);
  return out;
}

// A home é o próprio dist/index.html, reescrito no lugar: ela não passa
// pelo loop de rotas abaixo (não tem subpasta), mas precisa da mesma
// imagem — senão compartilhar scoliosisday.com mostraria uma miniatura e
// scoliosisday.com/sobre outra.
const html = applyOgImage(readFileSync(join(DIST, 'index.html'), 'utf8'));
writeFileSync(join(DIST, 'index.html'), html);
console.log('[seo] index.html (home)');

/**
 * Troca o `content` de uma <meta> já presente, seja qual for a
 * formatação: o Vite copia o index.html como está, e uma tag quebrada em
 * várias linhas não casa com espaço literal no padrão. Por isso `\s+`
 * entre os atributos, e por isso o nome da tag é parâmetro em vez de um
 * regex escrito à mão em cada chamada.
 */
function metaTag(source, attr, name, value) {
  const pattern = new RegExp(`(<meta\\s+${attr}="${name}"\\s+content=")[^"]*(")`);
  return replaceTag(source, pattern, `$1${value}$2`);
}

/** Troca o conteúdo de uma meta/link já presente no HTML. */
function replaceTag(source, pattern, replacement) {
  if (!pattern.test(source)) {
    throw new Error(`prerender-seo: tag não encontrada no index.html — ${pattern}`);
  }
  return source.replace(pattern, replacement);
}

for (const route of ROUTES) {
  const url = `${SITE}${route.path}`;
  let out = html;

  out = replaceTag(out, /<title>[^<]*<\/title>/, `<title>${route.title}</title>`);
  out = metaTag(out, 'name', 'description', route.description);
  out = replaceTag(out, /(<link\s+rel="canonical"\s+href=")[^"]*(")/, `$1${url}$2`);
  out = metaTag(out, 'property', 'og:url', url);
  out = metaTag(out, 'property', 'og:title', route.title);
  out = metaTag(out, 'property', 'og:description', route.description);
  out = metaTag(out, 'name', 'twitter:title', route.title);
  out = metaTag(out, 'name', 'twitter:description', route.description);

  const dir = join(DIST, route.path);
  mkdirSync(dir, { recursive: true });
  writeFileSync(join(dir, 'index.html'), out);
  console.log(`[seo] ${route.path}/index.html`);
}

// Sitemap: as 5 rotas públicas. Gerado aqui, e não à mão em /public, para
// não haver duas listas de rotas divergindo com o tempo.
const today = new Date().toISOString().slice(0, 10);
const urls = ['/', ...ROUTES.map((r) => r.path)]
  .map(
    (path) =>
      `  <url>\n    <loc>${SITE}${path}</loc>\n    <lastmod>${today}</lastmod>\n` +
      `    <changefreq>weekly</changefreq>\n    <priority>${path === '/' ? '1.0' : '0.8'}</priority>\n  </url>`,
  )
  .join('\n');

writeFileSync(
  join(DIST, 'sitemap.xml'),
  `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`,
);
console.log('[seo] sitemap.xml');

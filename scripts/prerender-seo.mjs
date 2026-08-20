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

import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const DIST = join(ROOT, 'dist');
const SITE = 'https://scoliosisday.com';

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

const html = readFileSync(join(DIST, 'index.html'), 'utf8');

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

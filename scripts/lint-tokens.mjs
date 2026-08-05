// scripts/lint-tokens.mjs
// Falha se encontrar valor bruto onde deveria haver token.
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, extname } from 'node:path';

const ROOT = 'src';
const ALLOWLIST = [
  'src/styles/design-system.css',
  // @font-face precisa de font-family literal (é a definição do nome da
  // fonte, não pode ser var(--token) — seria circular). Mesmo motivo de
  // design-system.css acima.
  'src/styles/tokens.css',
  // Paleta padrão do evento: hex são dados de conteúdo gravados no Firestore
  // (validados por regex hex no eventSchema), não estilo do painel.
  'src/features/events/constants/defaultPalette.js',
];

const RULES = [
  { name: 'cor hexadecimal',      re: /#[0-9a-fA-F]{3,8}\b/g },
  { name: 'cor rgb()/hsl()',      re: /\b(rgba?|hsla?)\s*\(/g },
  { name: 'font-family literal',  re: /font-family\s*:\s*(?!var\()/g },
  { name: 'box-shadow literal',   re: /box-shadow\s*:\s*(?!var\(|none)/g },
  { name: 'transição literal',    re: /\b\d+m?s\b(?![^(]*\))/g },
  { name: 'cubic-bezier literal', re: /cubic-bezier\s*\(/g },
];

// px é permitido em bordas finas, tamanhos de ícone e larguras fixas de layout.
// Espaçamento (padding/margin/gap) precisa vir de token.
const SPACING = /\b(padding|margin|gap|row-gap|column-gap)[^:;]*:\s*[^;]*?\b\d+px/g;

function walk(dir) {
  return readdirSync(dir).flatMap((f) => {
    const p = join(dir, f);
    return statSync(p).isDirectory() ? walk(p) : [p];
  });
}

let failures = 0;

for (const file of walk(ROOT)) {
  if (!['.css', '.jsx', '.js'].includes(extname(file))) continue;
  if (ALLOWLIST.some((a) => file.replace(/\\/g, '/').endsWith(a))) continue;

  const src = readFileSync(file, 'utf8');
  const checks = extname(file) === '.css' ? [...RULES, { name: 'espaçamento em px', re: SPACING }] : RULES;

  for (const { name, re } of checks) {
    for (const m of src.matchAll(re)) {
      const line = src.slice(0, m.index).split('\n').length;
      console.error(`✗ ${file}:${line} — ${name}: ${m[0].trim()}`);
      failures++;
    }
  }
}

if (failures) {
  console.error(`\n${failures} valor(es) bruto(s). Use var(--token). Veja a seção 12.3.`);
  process.exit(1);
}
console.log('✓ Nenhum valor bruto encontrado.');

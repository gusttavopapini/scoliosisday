// src/utils/ogImage.js
// Regras da imagem de preview de link (og:image) — a miniatura que aparece
// ao compartilhar o site no WhatsApp, no Google, no Facebook e no LinkedIn.
//
// Vive em utils/ pelo mesmo motivo de contentBlocks.js e pricingCards.js:
// é conhecimento compartilhado por mais de uma ponta. Aqui, pelo painel (que
// valida e avisa no upload) e pelo default do site — e nada disto é estilo,
// é regra de conteúdo.
//
// Por que estes números, e não outros:
//
//   · 1200×630 é o tamanho que Facebook e LinkedIn documentam para o card
//     grande, e é o que as meta tags og:image:width/height já declaram no
//     index.html hoje.
//   · 1,91:1 é a proporção desse par (1200/630 = 1,9048). É ela que o card
//     do WhatsApp usa para RECORTAR: uma imagem quadrada não aparece
//     inteira, perde as bordas de cima e de baixo.
//   · 600KB é o ponto em que o WhatsApp deixa de exibir a miniatura grande
//     e cai no ícone pequeno ao lado do texto. Não é limite de protocolo,
//     é comportamento observado do cliente — por isso AVISO, nunca
//     bloqueio: uma imagem de 700KB continua sendo escolha legítima do
//     administrador, que só precisa saber do risco.
//
// O limite DURO (2MB, tipos aceitos) mora em UPLOAD_PRESETS.ogImage e em
// storage.rules, que é quem de fato barra.

/** Dimensões recomendadas, iguais às declaradas em og:image:width/height. */
export const OG_IMAGE_RECOMMENDED = { width: 1200, height: 630 };

/** Proporção do card de compartilhamento (1200/630). */
export const OG_IMAGE_ASPECT_RATIO = OG_IMAGE_RECOMMENDED.width / OG_IMAGE_RECOMMENDED.height;

/** Acima disto o WhatsApp troca a miniatura grande pelo ícone pequeno. */
export const OG_IMAGE_WARN_BYTES = 600 * 1024;

/**
 * Quanto a proporção pode fugir de 1,91:1 antes de valer um aviso.
 *
 * 12% é folgado de propósito: 1200×675 (16:9, o tamanho que muita gente já
 * tem pronto) dá 1,778 — 6,6% fora — e recorta tão pouco que avisar ali
 * seria ruído. Já um quadrado (1,0) fica 47% fora e perde metade da altura
 * no card, que é exatamente o caso que o aviso existe para pegar.
 */
const ASPECT_TOLERANCE = 0.12;

/**
 * Avisos (não erros) sobre uma imagem escolhida para o preview.
 *
 * Devolve sempre um array — vazio quando está tudo bem. Nenhum destes
 * avisos impede o envio; quem barra é validateFile/storage.rules.
 *
 * @param {{ width: number, height: number, sizeBytes: number }} image
 * @returns {string[]}
 */
export function getOgImageWarnings({ width, height, sizeBytes }) {
  const warnings = [];

  if (sizeBytes > OG_IMAGE_WARN_BYTES) {
    const kb = Math.round(sizeBytes / 1024);
    warnings.push(
      `A imagem tem ${kb}KB. Acima de 600KB o WhatsApp costuma trocar a ` +
        'miniatura grande por um ícone pequeno. Considere comprimir.',
    );
  }

  // Guarda contra divisão por zero: uma imagem sem altura medida (leitura
  // falhou) não gera aviso de proporção, só não é avaliada.
  if (width > 0 && height > 0) {
    const ratio = width / height;
    const drift = Math.abs(ratio - OG_IMAGE_ASPECT_RATIO) / OG_IMAGE_ASPECT_RATIO;
    if (drift > ASPECT_TOLERANCE) {
      warnings.push(
        `A imagem é ${width}×${height} (proporção ${ratio.toFixed(2)}:1). O card ` +
          'recorta em 1,91:1, então as bordas vão ser cortadas. O ideal é ' +
          `${OG_IMAGE_RECOMMENDED.width}×${OG_IMAGE_RECOMMENDED.height}.`,
      );
    }
  }

  return warnings;
}

/**
 * Versão curta e nova a cada troca de imagem.
 *
 * Existe por causa do cache de preview: WhatsApp e Facebook guardam o card
 * por URL, de forma agressiva, e uma og:image com endereço idêntico
 * continua servindo a miniatura antiga por dias. Como a URL do Storage já
 * carrega um sufixo aleatório por upload (buildStoragePath), a versão é
 * redundância barata — ela entra como `?v=` no HTML e garante que o
 * endereço mude mesmo se um dia a política de nomes do Storage mudar.
 *
 * Não é hash criptográfico do arquivo de propósito: o valor não precisa ser
 * derivado do conteúdo, só precisa ser DIFERENTE do anterior. Calcular hash
 * exigiria ler o arquivo inteiro no navegador sem ganho nenhum.
 */
export function newOgImageVersion() {
  return `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;
}

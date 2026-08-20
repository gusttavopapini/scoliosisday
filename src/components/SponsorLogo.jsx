// src/components/SponsorLogo.jsx
// Logo de marca com PESO VISUAL equivalente entre proporções diferentes.
//
// Existe por um requisito de negócio: os apoiadores pagam o mesmo valor, e
// contrato de visibilidade significa que nenhum logo pode aparecer com mais
// destaque que outro. "Mesma altura para todos" NÃO entrega isso.
//
// O problema medido: escalar todo mundo para a mesma altura faz a área
// ocupada depender da proporção. Um logo largo e baixo preenche a linha; um
// alto e estreito vira um selo pequeno ao lado dele. Com os logos reais do
// projeto (proporções de 0.76 a 2.77), o menor ficava com 24% da área do
// maior — a ABTE contra a Sociedade Brasileira de Coluna.
//
// A correção: normalizar por ÁREA ÓTICA. Cada logo é escalado para que
// largura × altura renderizadas fiquem constantes, o que é o que o olho
// lê como "peso". Área igual, não altura igual.
//
// O TETO DE ALTURA (maxHeight) existe porque área estrita levaria um logo
// vertical a ficar bem mais alto que os vizinhos numa faixa horizontal —
// geometricamente justo, visualmente destoante. O teto troca uma fatia da
// uniformidade por harmonia: com os logos atuais, 80% em vez de 100%,
// contra os 24% de antes.
//
// Os parâmetros derivam de maxHeight (ver as duas constantes abaixo), então
// cada contexto passa só a sua altura máxima e recebe a MESMA uniformidade
// de 80% na sua própria escala — a esteira não precisa saber a matemática,
// e a página de patrocinadores não repete a conta com outros números.
//
// O que este componente NÃO resolve: padding embutido no arquivo. O
// navegador escala o canvas, e um logo com 57% de vazio em volta chega aqui
// já pequeno. Isso é corrigido recortando o arquivo antes do upload — foi
// feito para ABTE e Spinal Technology. Se um dia isso não bastar, o escape
// hatch é um campo `logoScale` por marca no admin (decidido documentar, não
// implementar, enquanto o recorte na origem der conta).

import { useCallback, useState } from 'react';

// Proporção mediana do conjunto real de logos. Serve de duas formas: é o
// palpite usado antes de a imagem carregar (o slot já nasce com um tamanho
// plausível, sem salto de layout perceptível) e é a referência que ancora a
// área alvo à escala que cada contexto já tinha.
const REFERENCE_RATIO = 1.91;

// Quanto o teto de altura excede a altura de um logo de proporção mediana.
// 68/48 é o par validado na esteira: mediana em 48px (a altura que a faixa
// já usava) e teto em 68px. Manter isso como RAZÃO, e não como número fixo,
// é o que faz o mesmo equilíbrio valer em qualquer contexto — ver targetArea.
const HEIGHT_HEADROOM = 68 / 48;

/**
 * @param {{
 *   src: string,
 *   alt: string,
 *   maxHeight: number,
 *   className?: string,
 * }} props
 * `maxHeight` é o teto em px do contexto — é ele que define toda a escala.
 */
export default function SponsorLogo({ src, alt, maxHeight, className = '' }) {
  const [ratio, setRatio] = useState(null);

  // Imagem em cache pode terminar de carregar antes de o React anexar o
  // onLoad, e o evento se perde — o ref cobre esse caso lendo `complete`
  // na montagem. Os dois caminhos levam ao mesmo setRatio.
  const measure = useCallback((img) => {
    if (!img?.naturalWidth || !img.naturalHeight) return;
    setRatio(img.naturalWidth / img.naturalHeight);
  }, []);

  const referenceHeight = maxHeight / HEIGHT_HEADROOM;
  const targetArea = referenceHeight * referenceHeight * REFERENCE_RATIO;

  const shape = ratio ?? REFERENCE_RATIO;
  let height = Math.sqrt(targetArea / shape);
  let width = Math.sqrt(targetArea * shape);
  if (height > maxHeight) {
    height = maxHeight;
    width = maxHeight * shape;
  }

  return (
    <img
      ref={measure}
      src={src}
      alt={alt}
      className={`sd-sponsor-logo${className ? ` ${className}` : ''}`}
      style={{ width: `${width}px`, height: `${height}px` }}
      onLoad={(event) => measure(event.currentTarget)}
    />
  );
}

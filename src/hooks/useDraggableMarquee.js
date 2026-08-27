// src/hooks/useDraggableMarquee.js
// Esteira infinita que anda sozinha E aceita arrasto do usuário, com
// inércia ao soltar. Hoje só a de Apoiadores da Home (HomeSupporters.jsx).
//
// ── POR QUE ISSO SAIU DO CSS ──────────────────────────────────────────
//
// A esteira era uma `animation` linear infinita com keyframe de
// translateX(0) até translateX(-100%/repeats). Arrastar exige
// escrever `transform` a cada pointermove, e o keyframe já é dono dessa
// mesma propriedade — as duas não compõem, uma anula a outra.
//
// `animation-play-state: paused` congela a animação, mas não resolve:
// para retomar DE ONDE PAROU depois do arrasto seria preciso descobrir a
// posição atual (getComputedStyle devolve a matrix), converter em tempo e
// reinjetar via `animation-delay` negativo — e mesmo assim o transform do
// drag continuaria brigando com o do keyframe durante o arrasto.
//
// Um único offset em px, atualizado por requestAnimationFrame, resolve os
// três casos (rolagem automática, arrasto, inércia) como estados da MESMA
// variável. É por isso que a animação virou JS.
//
// ── COMO O INFINITO FUNCIONA ──────────────────────────────────────────
//
// O JSX repete a lista real N vezes (ver MIN_TRACK_ITEMS/MIN_REPEATS em
// HomeSupporters.jsx). O offset é normalizado em módulo dentro de
// (-cicloEmPx, 0], então qualquer valor — inclusive o positivo que o
// arrasto para a DIREITA produz — cai de volta num ponto visualmente
// idêntico. Isso é o que impede o vazio à esquerda: o CSS antigo só
// andava para valores negativos e não tinha conteúdo "antes" do zero.
//
// O ciclo é medido pelo offsetLeft do primeiro item da segunda cópia, não
// por scrollWidth/repeats. A diferença importa: o track é flex com gap, e
// scrollWidth/repeats erra por gap/repeats px (~8px com 5 repetições),
// que era um micro-salto a cada volta no CSS antigo.

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';

/** Fallback da duração de uma volta, se o token CSS não puder ser lido. */
const FALLBACK_DURATION_S = 32;

/** Acima disso o gesto é arrasto e o clique no logo NÃO navega. */
const DRAG_THRESHOLD_PX = 5;

/** Constante de tempo da volta à velocidade automática, em segundos.
 *  Baixa demais mata a inércia (para seco); alta demais faz a esteira
 *  parecer descontrolada depois de um arrasto forte. */
const RELAX_TAU_S = 0.55;

/** Teto da velocidade de arremesso, em px/s. Um flick muito rápido no
 *  celular geraria centenas de px por frame e a esteira viraria um borrão
 *  antes de a inércia relaxar. */
const MAX_FLING_PX_S = 2600;

/** Peso da média móvel da velocidade. O ponteiro entrega amostras
 *  irregulares; sem suavizar, um único frame lento vira arremesso. */
const VELOCITY_SMOOTHING = 0.75;

/** Frames longos (aba em segundo plano, GC) não podem virar um salto
 *  gigante de offset quando o rAF volta. */
const MAX_FRAME_S = 0.05;

/** Silêncio do ponteiro, em ms, que já conta como "dedo parado" ao soltar:
 *  acima disso não há arremesso, mesmo que o gesto tenha sido rápido antes
 *  da pausa. */
const STALE_POINTER_MS = 100;

/**
 * Normaliza o offset para dentro de (-cycle, 0].
 *
 * O `%` de JS preserva o sinal do dividendo, então o dobro-módulo abaixo é
 * necessário: sem ele, um offset positivo (arrasto para a direita)
 * continuaria positivo e deixaria vazio à esquerda.
 */
function wrapOffset(offset, cycle) {
  if (!cycle || !Number.isFinite(offset)) return 0;
  return -((((-offset) % cycle) + cycle) % cycle);
}

/**
 * @param {{ itemsPerCycle: number }} options
 *   `itemsPerCycle` é quantos itens formam UMA cópia da lista real — o
 *   índice do item que abre a segunda cópia, usado para medir o ciclo.
 * @returns {{
 *   containerRef: React.RefObject<HTMLElement>,
 *   trackRef: React.RefObject<HTMLElement>,
 *   isDragging: boolean,
 *   handlers: object,
 * }} `handlers` vai espalhado no elemento que recebe o gesto.
 */
export function useDraggableMarquee({ itemsPerCycle }) {
  const containerRef = useRef(null);
  const trackRef = useRef(null);

  // Só isto é estado de React: é o único dado que precisa re-renderizar
  // (troca a classe do cursor). Offset, velocidade e ciclo vivem em refs
  // porque mudam a cada frame — em estado, causariam 60 renders/s.
  const [isDragging, setIsDragging] = useState(false);

  const offsetRef = useRef(0);
  const velocityRef = useRef(0);
  const cycleRef = useRef(0);
  const autoVelocityRef = useRef(0);

  const draggingRef = useRef(false);
  const pointerIdRef = useRef(null);
  const startXRef = useRef(0);
  const startOffsetRef = useRef(0);
  const lastXRef = useRef(0);
  const lastMoveTimeRef = useRef(0);
  // Distância máxima percorrida no gesto atual. É ela que separa clique de
  // arrasto ao fim do gesto.
  const movedRef = useRef(0);
  // Armado no fim de um arrasto de verdade, consumido pelo clique seguinte.
  // Não dá pra consultar movedRef direto no clique: ele sobrevive ao gesto,
  // e um Enter no logo (teclado) depois de um arrasto seria barrado sem ter
  // arrastado nada.
  const suppressClickRef = useRef(false);

  const reducedMotionRef = useRef(false);

  const applyTransform = useCallback(() => {
    const track = trackRef.current;
    if (!track) return;
    // translate3d (e não translateX) mantém o track em camada própria de
    // composição: o arrasto não dispara repaint dos logos.
    track.style.transform = `translate3d(${offsetRef.current}px, 0, 0)`;
  }, []);

  /**
   * Mede o ciclo e a velocidade automática derivada dele.
   *
   * Roda na montagem e sempre que o track muda de tamanho — o que inclui o
   * momento em que cada logo recebe width/height inline do SponsorLogo
   * depois de a imagem carregar. Sem isso, o ciclo seria medido com os
   * slots ainda no tamanho de palpite.
   */
  const measure = useCallback(() => {
    const track = trackRef.current;
    if (!track || !itemsPerCycle) return;

    const items = track.children;
    // Precisa existir a segunda cópia para haver o que medir.
    if (items.length <= itemsPerCycle) return;

    const cycle = items[itemsPerCycle].offsetLeft - items[0].offsetLeft;
    if (!cycle || cycle <= 0) return;

    cycleRef.current = cycle;

    // A duração continua vindo do token --sdp-marquee-duration: a
    // velocidade em px/s é derivada dele, então mexer no token continua
    // sendo o jeito de mudar a velocidade da esteira, como antes.
    const raw = getComputedStyle(track).getPropertyValue('--sdp-marquee-duration').trim();
    const seconds = Number.parseFloat(raw) || FALLBACK_DURATION_S;

    // Negativa: a esteira anda para a esquerda, como no keyframe antigo.
    autoVelocityRef.current = -cycle / seconds;

    // O ciclo mudou (logos carregaram, viewport redimensionou): o offset
    // atual pode ter ficado fora da faixa válida.
    offsetRef.current = wrapOffset(offsetRef.current, cycle);
    applyTransform();
  }, [itemsPerCycle, applyTransform]);

  // useLayoutEffect: mede antes da pintura, então o primeiro frame já sai
  // com o transform certo em vez de piscar em translate3d(0).
  useLayoutEffect(() => {
    measure();
  }, [measure]);

  useEffect(() => {
    const track = trackRef.current;
    if (!track || typeof ResizeObserver === 'undefined') return;

    // Observa o track (muda quando os logos ganham tamanho real) e o
    // container (muda quando a viewport redimensiona).
    const observer = new ResizeObserver(measure);
    observer.observe(track);
    if (containerRef.current) observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, [measure]);

  // prefers-reduced-motion: a rolagem automática desliga (era `animation:
  // none` no CSS), mas o arrasto continua — é movimento pedido pelo
  // usuário, não imposto pela página. Com a preferência ativa, a
  // velocidade-alvo passa a ser 0, então a mesma fórmula de relaxamento
  // que devolve à velocidade automática vira uma parada suave.
  useEffect(() => {
    const query = window.matchMedia('(prefers-reduced-motion: reduce)');
    const sync = () => { reducedMotionRef.current = query.matches; };
    sync();
    query.addEventListener('change', sync);
    return () => query.removeEventListener('change', sync);
  }, []);

  // ── Loop de animação ────────────────────────────────────────────────
  //
  // Um só laço cobre os três estados. Arrastando, o offset já foi escrito
  // pelo pointermove e o laço só pinta. Solto, a velocidade relaxa
  // exponencialmente até a velocidade automática — é isso que dá a
  // inércia: logo após o arremesso a velocidade é a do dedo e decai
  // suavemente até virar a da esteira, sem transição costurada à mão.
  useEffect(() => {
    let frameId = 0;
    let previous = 0;

    function frame(now) {
      const elapsed = previous ? Math.min((now - previous) / 1000, MAX_FRAME_S) : 0;
      previous = now;

      if (!draggingRef.current && elapsed > 0) {
        const target = reducedMotionRef.current ? 0 : autoVelocityRef.current;
        // Relaxamento exponencial independente da taxa de quadros: em 30fps
        // ou 120fps a inércia dura o mesmo tempo de relógio.
        const k = 1 - Math.exp(-elapsed / RELAX_TAU_S);
        velocityRef.current += (target - velocityRef.current) * k;
        offsetRef.current = wrapOffset(
          offsetRef.current + velocityRef.current * elapsed,
          cycleRef.current,
        );
        applyTransform();
      }

      frameId = requestAnimationFrame(frame);
    }

    frameId = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(frameId);
  }, [applyTransform]);

  // ── Gesto ───────────────────────────────────────────────────────────

  const handlePointerDown = useCallback((event) => {
    // Só o botão principal do mouse; toque e caneta não têm `button`
    // relevante e chegam como 0.
    if (event.button !== 0) return;

    draggingRef.current = true;
    pointerIdRef.current = event.pointerId;
    startXRef.current = event.clientX;
    lastXRef.current = event.clientX;
    startOffsetRef.current = offsetRef.current;
    lastMoveTimeRef.current = event.timeStamp;
    movedRef.current = 0;
    velocityRef.current = 0;
    // Depois de um arrasto por toque o browser costuma engolir o clique
    // sozinho, e a supressão armada no gesto anterior ficaria pendurada
    // pro próximo toque. Limpar aqui garante que ela nunca atravesse gestos.
    suppressClickRef.current = false;
    setIsDragging(true);

    // Sem captura, arrastar para fora da esteira (ou soltar fora da
    // janela) perderia o pointerup e o arrasto ficaria grudado no cursor.
    event.currentTarget.setPointerCapture?.(event.pointerId);
  }, []);

  const handlePointerMove = useCallback((event) => {
    if (!draggingRef.current || event.pointerId !== pointerIdRef.current) return;

    const delta = event.clientX - startXRef.current;
    movedRef.current = Math.max(movedRef.current, Math.abs(delta));

    offsetRef.current = wrapOffset(startOffsetRef.current + delta, cycleRef.current);
    applyTransform();

    // Velocidade instantânea suavizada, para o arremesso não depender de
    // um único frame que por acaso demorou mais.
    const dt = (event.timeStamp - lastMoveTimeRef.current) / 1000;
    if (dt > 0) {
      const instant = (event.clientX - lastXRef.current) / dt;
      velocityRef.current =
        velocityRef.current * (1 - VELOCITY_SMOOTHING) + instant * VELOCITY_SMOOTHING;
    }
    lastXRef.current = event.clientX;
    lastMoveTimeRef.current = event.timeStamp;
  }, [applyTransform]);

  const endDrag = useCallback((event) => {
    if (!draggingRef.current || event.pointerId !== pointerIdRef.current) return;

    draggingRef.current = false;
    pointerIdRef.current = null;
    setIsDragging(false);

    // Dedo parado antes de soltar: sem arremesso. Sem isso, a velocidade
    // do último movimento sobreviveria a uma pausa e a esteira dispararia
    // ao soltar.
    if (event.timeStamp - lastMoveTimeRef.current > STALE_POINTER_MS) {
      velocityRef.current = 0;
    }

    velocityRef.current = Math.max(
      -MAX_FLING_PX_S,
      Math.min(MAX_FLING_PX_S, velocityRef.current),
    );

    suppressClickRef.current = movedRef.current > DRAG_THRESHOLD_PX;

    // hasPointerCapture antes de soltar: em pointercancel o browser já
    // liberou a captura por conta própria, e releasePointerCapture num
    // ponteiro que não está mais capturado lança NotFoundError.
    if (event.currentTarget.hasPointerCapture?.(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
  }, []);

  // Os logos são <a>. Um arrasto que começou em cima de um deles não pode
  // navegar ao soltar — abaixo do limiar é clique de verdade e o link
  // abre normalmente. Fase de captura: intercepta antes de o <a> agir.
  const handleClickCapture = useCallback((event) => {
    if (!suppressClickRef.current) return;
    // Consome: só o clique gerado POR ESTE arrasto é barrado.
    suppressClickRef.current = false;
    event.preventDefault();
    event.stopPropagation();
  }, []);

  // <a> e <img> são arrastáveis nativamente no desktop: sem isto, o
  // browser inicia seu próprio drag-and-drop (com a imagem fantasma) e
  // rouba o gesto no meio do caminho.
  const handleDragStart = useCallback((event) => event.preventDefault(), []);

  return {
    containerRef,
    trackRef,
    isDragging,
    handlers: {
      onPointerDown: handlePointerDown,
      onPointerMove: handlePointerMove,
      onPointerUp: endDrag,
      onPointerCancel: endDrag,
      onClickCapture: handleClickCapture,
      onDragStart: handleDragStart,
    },
  };
}

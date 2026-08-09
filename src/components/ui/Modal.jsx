// src/components/ui/Modal.jsx
// Primitivo de modal acessível, usado por todo o painel.
//
// Garante o que cada modal reimplementava (ou esquecia):
//   · foco movido para dentro do painel ao abrir;
//   · Tab e Shift+Tab circulando apenas entre os focáveis do painel;
//   · Esc fechando;
//   · foco devolvido ao elemento que abriu o modal.

import { useEffect, useRef } from 'react';

const FOCUSABLE_SELECTOR = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(', ');

function getFocusable(container) {
  if (!container) return [];
  return Array.from(container.querySelectorAll(FOCUSABLE_SELECTOR)).filter(
    (el) => el.offsetParent !== null || el === document.activeElement,
  );
}

/**
 * @param {{
 *   labelledBy: string,
 *   onClose: () => void,
 *   children: React.ReactNode,
 *   isBusy?: boolean,
 *   closeOnOverlay?: boolean,
 *   panelClassName?: string,
 * }} props
 */
export default function Modal({
  labelledBy,
  onClose,
  children,
  isBusy = false,
  closeOnOverlay = true,
  panelClassName,
}) {
  const panelRef = useRef(null);
  const restoreFocusRef = useRef(null);

  // Guarda o disparador, move o foco para dentro e devolve ao desmontar.
  useEffect(() => {
    restoreFocusRef.current = document.activeElement;

    const focusables = getFocusable(panelRef.current);
    (focusables[0] ?? panelRef.current)?.focus();

    return () => {
      restoreFocusRef.current?.focus?.();
    };
  }, []);

  // Trava o scroll da página por trás enquanto o modal está aberto — vale
  // pra qualquer consumidor deste primitivo (PersonModal, ArchiveGalleryLightbox
  // no site público; ConfirmModal, DiscardChangesModal etc no painel), uma
  // correção só cobre todos. overflow:hidden sozinho não impede o scroll
  // por trás em touch no iOS Safari; position:fixed trava de fato, mas
  // precisa compensar o scroll atual (top negativo) pra não pular a
  // página pro topo, e restaurar a posição exata ao fechar. O scroll
  // interno do modal continua funcionando — .sda-modal__body já tem
  // overflow-y:auto próprio, alheio ao que acontece no body.
  useEffect(() => {
    const { body } = document;
    const scrollY = window.scrollY;
    const previous = {
      overflow: body.style.overflow,
      position: body.style.position,
      top: body.style.top,
      width: body.style.width,
    };

    body.style.overflow = 'hidden';
    body.style.position = 'fixed';
    body.style.top = `-${scrollY}px`;
    body.style.width = '100%';

    return () => {
      body.style.overflow = previous.overflow;
      body.style.position = previous.position;
      body.style.top = previous.top;
      body.style.width = previous.width;
      window.scrollTo(0, scrollY);
    };
  }, []);

  function handleKeyDown(event) {
    if (event.key === 'Escape') {
      if (!isBusy) onClose();
      return;
    }

    if (event.key !== 'Tab') return;

    const focusables = getFocusable(panelRef.current);
    if (focusables.length === 0) {
      event.preventDefault();
      return;
    }

    const first = focusables[0];
    const last = focusables[focusables.length - 1];

    // Circula em vez de deixar o foco escapar para a página atrás.
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  }

  return (
    <div
      className="sda-modal"
      role="dialog"
      aria-modal="true"
      aria-labelledby={labelledBy}
      onKeyDown={handleKeyDown}
    >
      <div
        className="sda-modal__overlay"
        onClick={() => closeOnOverlay && !isBusy && onClose()}
        aria-hidden="true"
      />
      <div
        className={`sda-modal__panel${panelClassName ? ` ${panelClassName}` : ''}`}
        ref={panelRef}
        tabIndex={-1}
      >
        {children}
      </div>
    </div>
  );
}

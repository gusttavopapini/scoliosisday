// src/hooks/useDiscardGuard.js
// Guarda de saída dos formulários do painel.
//
// Sem alteração pendente, cancelar sai direto — pedir confirmação para
// descartar nada só treina o usuário a clicar sem ler. Com alteração, abre a
// confirmação e só sai depois do "Descartar".

import { useCallback, useState } from 'react';

/**
 * @param {{ isDirty: boolean, onLeave: () => void }} params
 *   isDirty — se há alteração não salva.
 *   onLeave — para onde ir ao descartar (normalmente navigate para a listagem).
 * @returns {{
 *   isConfirmOpen: boolean,
 *   requestLeave: () => void,
 *   confirmLeave: () => void,
 *   cancelLeave: () => void,
 * }}
 */
export function useDiscardGuard({ isDirty, onLeave }) {
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

  const requestLeave = useCallback(() => {
    if (isDirty) {
      setIsConfirmOpen(true);
      return;
    }
    onLeave();
  }, [isDirty, onLeave]);

  const confirmLeave = useCallback(() => {
    setIsConfirmOpen(false);
    onLeave();
  }, [onLeave]);

  const cancelLeave = useCallback(() => setIsConfirmOpen(false), []);

  return { isConfirmOpen, requestLeave, confirmLeave, cancelLeave };
}

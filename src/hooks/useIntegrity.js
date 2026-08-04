// src/hooks/useIntegrity.js
// Hooks de integridade referencial (seção 11 — cascatas).

import { useState, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import {
  findCollaboratorUsages,
  removeSponsorFromEvents,
  findEventsByProgramming,
  clearProgrammingFromEvents,
} from '../services/integrity.js';

/**
 * Consulta imperativa: roda no momento em que o usuário pede a exclusão
 * (ou a troca de tipo), não a cada render.
 */
export function useCollaboratorUsages() {
  const [isChecking, setIsChecking] = useState(false);

  const check = useCallback(async (collaboratorId) => {
    setIsChecking(true);
    try {
      return await findCollaboratorUsages(collaboratorId);
    } finally {
      setIsChecking(false);
    }
  }, []);

  return { check, isChecking };
}

/** Eventos afetados pela exclusão de uma programação — para o aviso prévio. */
export function useProgrammingImpact() {
  const [isChecking, setIsChecking] = useState(false);

  const check = useCallback(async (programmingId) => {
    setIsChecking(true);
    try {
      return await findEventsByProgramming(programmingId);
    } finally {
      setIsChecking(false);
    }
  }, []);

  return { check, isChecking };
}

/**
 * Cascatas executadas antes da exclusão do documento principal.
 * Invalidam a query de eventos, já alterados pela cascata.
 */
export function useCascades() {
  const queryClient = useQueryClient();

  const cascadeSponsor = useCallback(
    async (sponsorId) => {
      const affected = await removeSponsorFromEvents(sponsorId);
      queryClient.invalidateQueries({ queryKey: ['events'] });
      return affected;
    },
    [queryClient],
  );

  const cascadeProgramming = useCallback(
    async (programmingId) => {
      const affected = await clearProgrammingFromEvents(programmingId);
      queryClient.invalidateQueries({ queryKey: ['events'] });
      return affected;
    },
    [queryClient],
  );

  return { cascadeSponsor, cascadeProgramming };
}

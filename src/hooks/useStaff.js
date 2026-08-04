// src/hooks/useStaff.js
// Hooks da equipe — leitura e mutações sobre users/.

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  fetchStaffUsers,
  countPendingStaff,
  approveStaffUser,
  rejectStaffUser,
  disableStaffUser,
  deleteStaffUser,
  createStaffMember,
} from '../services/staff.js';

const QUERY_KEY = ['staff'];

/**
 * Só o admin lê users/ — as Security Rules negam para staff.
 * Quem chama fora da tela /staff deve passar { enabled: isAdmin }.
 * @param {{ enabled?: boolean }} [options]
 */
export function useStaffUsers({ enabled = true } = {}) {
  return useQuery({
    queryKey: QUERY_KEY,
    queryFn: fetchStaffUsers,
    enabled,
  });
}

/**
 * Só o número de pendentes — o dashboard não precisa dos documentos.
 * @param {{ enabled?: boolean }} [options]
 */
export function usePendingStaffCount({ enabled = true } = {}) {
  return useQuery({
    queryKey: [...QUERY_KEY, 'pending-count'],
    queryFn: countPendingStaff,
    enabled,
  });
}

/** Fábrica das mutações: todas invalidam a mesma chave. */
function useStaffMutation(mutationFn) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
    },
  });
}

export function useApproveStaffUser() {
  return useStaffMutation(({ uid, email }) => approveStaffUser(uid, email));
}

export function useRejectStaffUser() {
  return useStaffMutation((uid) => rejectStaffUser(uid));
}

export function useDisableStaffUser() {
  return useStaffMutation((uid) => disableStaffUser(uid));
}

export function useDeleteStaffUser() {
  return useStaffMutation((uid) => deleteStaffUser(uid));
}

export function useCreateStaffMember() {
  return useStaffMutation((data) => createStaffMember(data));
}

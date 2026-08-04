// src/hooks/useProgrammings.js
// React Query hooks para programações.

import {
  useQuery,
  useInfiniteQuery,
  useMutation,
  useQueryClient,
} from '@tanstack/react-query';
import * as programmingService from '../services/programmings.js';

/** Lista inteira — para o seletor do wizard de eventos. */
export function useProgrammings() {
  return useQuery({
    queryKey: ['programmings'],
    queryFn: programmingService.fetchProgrammings,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
}

/** Lista paginada da tela de programações: 20 por vez, com cursor. */
export function useProgrammingsPage() {
  const result = useInfiniteQuery({
    queryKey: ['programmings', 'page'],
    queryFn: ({ pageParam }) => programmingService.fetchProgrammingsPage({ cursor: pageParam }),
    initialPageParam: null,
    getNextPageParam: (lastPage) => lastPage.nextCursor,
  });

  return {
    ...result,
    programmings: result.data?.pages.flatMap((page) => page.items) ?? [],
  };
}

/** Total de programações, via getCountFromServer — dashboard. */
export function useProgrammingCount() {
  return useQuery({
    queryKey: ['programmings', 'count'],
    queryFn: programmingService.countProgrammings,
  });
}

export function useProgramming(id) {
  return useQuery({
    queryKey: ['programming', id],
    queryFn: () => programmingService.fetchProgrammingById(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
}

export function useCreateProgramming() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: programmingService.createProgramming,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['programmings'] });
    },
  });
}

export function useUpdateProgramming() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }) => programmingService.updateProgramming(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['programmings'] });
    },
  });
}

export function useDeleteProgramming() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: programmingService.deleteProgramming,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['programmings'] });
    },
  });
}

export function useDuplicateProgramming() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: programmingService.duplicateProgramming,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['programmings'] });
    },
  });
}

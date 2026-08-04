// src/hooks/useSponsors.js
// React Query hooks para patrocinadores.

import {
  useQuery,
  useInfiniteQuery,
  useMutation,
  useQueryClient,
} from '@tanstack/react-query';
import * as sponsorService from '../services/sponsors.js';

/** Lista inteira — para o seletor do wizard de eventos. */
export function useSponsors() {
  return useQuery({
    queryKey: ['sponsors'],
    queryFn: sponsorService.fetchSponsors,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
}

/** Lista paginada da tela de patrocinadores: 20 por vez, com cursor. */
export function useSponsorsPage() {
  const result = useInfiniteQuery({
    queryKey: ['sponsors', 'page'],
    queryFn: ({ pageParam }) => sponsorService.fetchSponsorsPage({ cursor: pageParam }),
    initialPageParam: null,
    getNextPageParam: (lastPage) => lastPage.nextCursor,
  });

  return {
    ...result,
    sponsors: result.data?.pages.flatMap((page) => page.items) ?? [],
  };
}

/** Total de patrocinadores, via getCountFromServer — dashboard. */
export function useSponsorCount() {
  return useQuery({
    queryKey: ['sponsors', 'count'],
    queryFn: sponsorService.countSponsors,
  });
}

export function useSponsor(id) {
  return useQuery({
    queryKey: ['sponsor', id],
    queryFn: () => sponsorService.fetchSponsorById(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
}

/**
 * Cria um patrocinador. Aceita `{ data, id }` — o id vem do formulário quando
 * a logo já foi enviada ao Storage num caminho que o usa.
 */
export function useCreateSponsor() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ data, id }) => sponsorService.createSponsor(data, id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sponsors'] });
    },
  });
}

export function useUpdateSponsor() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }) => sponsorService.updateSponsor(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sponsors'] });
    },
  });
}

export function useDeleteSponsor() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: sponsorService.deleteSponsor,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sponsors'] });
    },
  });
}

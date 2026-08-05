// src/hooks/useBanners.js
// React Query hooks para banners.

import {
  useQuery,
  useInfiniteQuery,
  useMutation,
  useQueryClient,
} from '@tanstack/react-query';
import * as bannerService from '../services/banners.js';

const QUERY_KEY = ['banners'];

/** Lista inteira, ordenada por posição — carrossel da Home e formulário do painel. */
export function useBanners() {
  return useQuery({
    queryKey: QUERY_KEY,
    queryFn: bannerService.fetchBanners,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
}

/** Lista paginada da tela de banners: 20 por vez, com cursor. */
export function useBannersPage() {
  const result = useInfiniteQuery({
    queryKey: [...QUERY_KEY, 'page'],
    queryFn: ({ pageParam }) => bannerService.fetchBannersPage({ cursor: pageParam }),
    initialPageParam: null,
    getNextPageParam: (lastPage) => lastPage.nextCursor,
  });

  return {
    ...result,
    banners: result.data?.pages.flatMap((page) => page.items) ?? [],
  };
}

export function useBanner(id) {
  return useQuery({
    queryKey: [...QUERY_KEY, id],
    queryFn: () => bannerService.fetchBannerById(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
}

/**
 * Cria um banner. Aceita `{ data, id }` — o id vem do formulário quando
 * as artes já foram enviadas ao Storage num caminho que o usa.
 */
export function useCreateBanner() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ data, id }) => bannerService.createBanner(data, id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
    },
  });
}

export function useUpdateBanner() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }) => bannerService.updateBanner(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
    },
  });
}

export function useDeleteBanner() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: bannerService.deleteBanner,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
    },
  });
}

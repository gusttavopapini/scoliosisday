// src/hooks/useSeoSettings.js
// React Query hooks para os metadados de compartilhamento (settings/seo).
// Mesmo desenho de useSettings.js, com uma diferença de propósito: só o
// painel consome estes dados. O site público não lê este documento em
// runtime — quem o lê é o build (scripts/prerender-seo.mjs).

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { fetchSeoSettings, saveOgImage, clearOgImage } from '../services/seoSettings.js';

const QUERY_KEY = ['settings', 'seo'];

export function useSeoSettings() {
  return useQuery({
    queryKey: QUERY_KEY,
    queryFn: fetchSeoSettings,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
}

export function useSaveOgImage() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: saveOgImage,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: QUERY_KEY }),
  });
}

export function useClearOgImage() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: clearOgImage,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: QUERY_KEY }),
  });
}

// src/hooks/useSettings.js
// React Query hooks para configurações globais do site (settings/socialMedia).

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { fetchSocialLinks, saveSocialLinks } from '../services/settings.js';

const QUERY_KEY = ['settings', 'socialMedia'];

/** Lista de redes sociais — painel (SocialMediaModal) e site público (PublicFooter). */
export function useSocialLinks() {
  return useQuery({
    queryKey: QUERY_KEY,
    queryFn: fetchSocialLinks,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
}

export function useSaveSocialLinks() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: saveSocialLinks,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
    },
  });
}

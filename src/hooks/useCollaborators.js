// src/hooks/useCollaborators.js
// Hook para buscar colaboradores usando TanStack Query.

import {
  useQuery,
  useInfiniteQuery,
  useMutation,
  useQueryClient,
} from '@tanstack/react-query';
import {
  fetchCollaborators,
  fetchCollaboratorsPage,
  countCollaborators,
  fetchCollaboratorById,
  fetchCollaboratorsByType,
  createCollaborator,
  updateCollaborator,
  deleteCollaborator,
} from '../services/collaborators.js';

const QUERY_KEY = ['collaborators'];

/**
 * Hook para buscar todos os colaboradores — usado pelos seletores de
 * palestrantes, que precisam da lista inteira.
 * @returns {Object} { data, isLoading, error, refetch }
 */
export function useCollaborators() {
  return useQuery({
    queryKey: QUERY_KEY,
    queryFn: fetchCollaborators,
    staleTime: 1000 * 60 * 5, // 5 min
  });
}

/**
 * Lista paginada da tela de colaboradores: 20 por vez, com cursor.
 * @returns {Object} resultado do useInfiniteQuery + `collaborators` achatado
 */
export function useCollaboratorsPage() {
  const result = useInfiniteQuery({
    queryKey: [...QUERY_KEY, 'page'],
    queryFn: ({ pageParam }) => fetchCollaboratorsPage({ cursor: pageParam }),
    initialPageParam: null,
    getNextPageParam: (lastPage) => lastPage.nextCursor,
  });

  return {
    ...result,
    collaborators: result.data?.pages.flatMap((page) => page.items) ?? [],
  };
}

/** Totais por tipo, via getCountFromServer — dashboard. */
export function useCollaboratorCounts() {
  return useQuery({
    queryKey: [...QUERY_KEY, 'count'],
    queryFn: countCollaborators,
  });
}

/**
 * Hook para buscar um colaborador por ID.
 * @param {string} id
 * @returns {Object}
 */
export function useCollaborator(id) {
  return useQuery({
    queryKey: [...QUERY_KEY, id],
    queryFn: () => fetchCollaboratorById(id),
    enabled: !!id,
    staleTime: 1000 * 60 * 5,
  });
}

/**
 * Hook para buscar colaboradores por tipo.
 * @param {string} type
 * @returns {Object}
 */
export function useCollaboratorsByType(type) {
  return useQuery({
    queryKey: [...QUERY_KEY, 'type', type],
    queryFn: () => fetchCollaboratorsByType(type),
    enabled: !!type,
    staleTime: 1000 * 60 * 5,
  });
}

/**
 * Hook para criar um colaborador.
 * @returns {Object} { mutate, isPending, error }
 */
/**
 * Cria um colaborador. Aceita `{ data, id }` — o id vem do formulário quando
 * a foto já foi enviada ao Storage num caminho que o usa.
 */
export function useCreateCollaborator() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ data, id }) => createCollaborator(data, id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
    },
  });
}

/**
 * Hook para atualizar um colaborador.
 * @returns {Object}
 */
export function useUpdateCollaborator() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }) => updateCollaborator(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: [...QUERY_KEY, id] });
    },
  });
}

/**
 * Hook para deletar um colaborador.
 * @returns {Object}
 */
export function useDeleteCollaborator() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteCollaborator,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
    },
  });
}

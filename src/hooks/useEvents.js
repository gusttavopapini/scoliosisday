// src/hooks/useEvents.js
// Hook para gerenciar eventos — CRUD + publish/duplicate

import {
  useQuery,
  useInfiniteQuery,
  useMutation,
  useQueryClient,
} from '@tanstack/react-query';
import {
  fetchEvents,
  fetchEventsPage,
  fetchRecentEvents,
  countEvents,
  fetchEventById,
  fetchCurrentEvent,
  fetchCurrentPublicEvent,
  fetchPublishedEvents,
  setCurrentEvent,
  clearCurrentEvent,
  createEvent,
  updateEvent,
  saveEvent,
  deleteEvent,
  publishEvent,
  duplicateEvent,
} from '../services/events.js';

const QUERY_KEY = ['events'];

/** Lista inteira — para os seletores de formulário. */
export function useEvents() {
  return useQuery({
    queryKey: QUERY_KEY,
    queryFn: fetchEvents,
  });
}

/**
 * Lista paginada da tela de eventos: 20 por vez, com cursor.
 * `data.pages` vem achatado em `events` para o consumidor não se preocupar.
 */
export function useEventsPage() {
  const result = useInfiniteQuery({
    queryKey: [...QUERY_KEY, 'page'],
    queryFn: ({ pageParam }) => fetchEventsPage({ cursor: pageParam }),
    initialPageParam: null,
    getNextPageParam: (lastPage) => lastPage.nextCursor,
  });

  return {
    ...result,
    events: result.data?.pages.flatMap((page) => page.items) ?? [],
  };
}

/** Os eventos editados mais recentemente — dashboard. */
export function useRecentEvents(max = 5) {
  return useQuery({
    queryKey: [...QUERY_KEY, 'recent', max],
    queryFn: () => fetchRecentEvents(max),
  });
}

/** Totais por status, via getCountFromServer — dashboard. */
export function useEventCounts() {
  return useQuery({
    queryKey: [...QUERY_KEY, 'count'],
    queryFn: countEvents,
  });
}

/** O evento em destaque — buscado à parte para encabeçar a listagem. */
export function useCurrentEvent() {
  return useQuery({
    queryKey: [...QUERY_KEY, 'current'],
    queryFn: fetchCurrentEvent,
  });
}

/**
 * O evento em destaque publicado — usado pelo site público.
 * Chave própria: o resultado difere do de useCurrentEvent quando o destaque
 * ainda está em rascunho, e as duas não podem compartilhar cache.
 */
export function useCurrentPublicEvent() {
  return useQuery({
    queryKey: [...QUERY_KEY, 'current', 'public'],
    queryFn: fetchCurrentPublicEvent,
  });
}

/**
 * Eventos publicados, mais recentes primeiro — site público.
 * A Home deriva daqui o contador de edições e os depoimentos da edição
 * mais recente, sem uma segunda consulta.
 */
export function usePublishedEvents() {
  return useQuery({
    queryKey: [...QUERY_KEY, 'published', 'public'],
    queryFn: fetchPublishedEvents,
  });
}

/** Define o evento atual, desmarcando o anterior no mesmo batch. */
export function useSetCurrentEvent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: setCurrentEvent,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
    },
  });
}

/** Tira o evento do destaque, sem eleger outro. */
export function useClearCurrentEvent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: clearCurrentEvent,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
    },
  });
}

export function useEvent(id) {
  return useQuery({
    // Spread, não aninhamento: [QUERY_KEY, id] geraria [['events'], id], que
    // não casa com o prefixo ['events'] das invalidações das mutações.
    queryKey: [...QUERY_KEY, id],
    queryFn: () => fetchEventById(id),
    enabled: !!id,
  });
}

export function useCreateEvent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createEvent,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
    },
  });
}

export function useUpdateEvent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }) => updateEvent(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
    },
  });
}

/**
 * Grava um evento em um ID conhecido (rascunho automático e submit do wizard).
 * Serve tanto para criação quanto para edição, sem duplicar documentos.
 */
export function useSaveEvent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }) => saveEvent(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
    },
  });
}

export function useDeleteEvent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteEvent,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
    },
    // Sem isso, uma falha aqui (ex: permission-denied silenciosamente
    // engolida por algum código no meio do caminho) não deixaria rastro
    // nenhum no console — só o toast genérico do componente, que não diz
    // qual foi o erro real.
    onError: (error) => {
      console.error('[useDeleteEvent] Falha ao excluir evento:', error);
    },
  });
}

export function usePublishEvent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: publishEvent,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
    },
  });
}

export function useDuplicateEvent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: duplicateEvent,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
    },
  });
}

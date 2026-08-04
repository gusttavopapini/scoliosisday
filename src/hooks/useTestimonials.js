// src/hooks/useTestimonials.js
// React Query hooks para depoimentos (/painel/depoimentos).

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as testimonialService from '../services/testimonials.js';

const QUERY_KEY = ['testimonials'];

/** Depoimentos de um type — a tela de listagem chama uma vez por aba ativa,
 * não a coleção inteira de uma vez. */
export function useTestimonials(type) {
  return useQuery({
    queryKey: [...QUERY_KEY, type],
    queryFn: () => testimonialService.fetchTestimonials(type),
    enabled: !!type,
  });
}

export function useTestimonial(id) {
  return useQuery({
    // Spread, não aninhamento: ver a nota em useEvents.js.
    queryKey: [...QUERY_KEY, id],
    queryFn: () => testimonialService.fetchTestimonialById(id),
    enabled: !!id,
  });
}

export function useCreateTestimonial() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ data, createdBy, id }) =>
      testimonialService.createTestimonial(data, createdBy, id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
    },
  });
}

export function useUpdateTestimonial() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }) => testimonialService.updateTestimonial(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
    },
  });
}

export function useDeleteTestimonial() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: testimonialService.deleteTestimonial,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
    },
  });
}

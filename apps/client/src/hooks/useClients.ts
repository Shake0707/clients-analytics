import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { CreateClientInput, PeriodQuery, UpdateClientInput } from '@nodex/shared';
import { clientsApi } from '../api';

export function useClients(period: PeriodQuery, search: string, limit: number) {
  return useQuery({
    queryKey: ['clients', period, search, limit],
    queryFn: () => clientsApi.list(period, search, limit),
  });
}

export function useClient(id: number, period: PeriodQuery) {
  return useQuery({
    queryKey: ['client', id, period],
    enabled: Number.isFinite(id) && id > 0,
    queryFn: () => clientsApi.get(id, period),
  });
}

/** Быстрый поиск клиентов для экрана продажи. */
export function useClientSearch(search: string, enabled: boolean) {
  return useQuery({
    queryKey: ['client-search', search],
    enabled,
    queryFn: () => clientsApi.search(search),
  });
}

export function useCreateClient() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateClientInput) => clientsApi.create(input),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['clients'] });
      void qc.invalidateQueries({ queryKey: ['client-search'] });
    },
  });
}

export function useUpdateClient() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: number; input: UpdateClientInput }) =>
      clientsApi.update(id, input),
    onSuccess: () => void qc.invalidateQueries(),
  });
}

export function useDeleteClient() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => clientsApi.remove(id),
    onSuccess: () => void qc.invalidateQueries(),
  });
}

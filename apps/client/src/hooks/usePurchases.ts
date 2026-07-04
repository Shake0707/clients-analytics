import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { CreateSaleInput, PeriodQuery, UpdateSaleInput } from '@nodex/shared';
import { purchasesApi } from '../api';

export function usePurchases(period: PeriodQuery, search: string, limit: number) {
  return useQuery({
    queryKey: ['purchases', period, search, limit],
    queryFn: () => purchasesApi.list(period, search, limit),
  });
}

export function usePurchase(id: number) {
  return useQuery({
    queryKey: ['purchase', id],
    enabled: Number.isFinite(id) && id > 0,
    queryFn: () => purchasesApi.get(id),
  });
}

export function useCreateSale() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateSaleInput) => purchasesApi.create(input),
    onSuccess: () => {
      void qc.invalidateQueries();
    },
  });
}

export function useUpdateSale() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: number; input: UpdateSaleInput }) =>
      purchasesApi.update(id, input),
    onSuccess: () => void qc.invalidateQueries(),
  });
}

export function useDeleteSale() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => purchasesApi.remove(id),
    onSuccess: () => void qc.invalidateQueries(),
  });
}

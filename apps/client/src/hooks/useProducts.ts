import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type {
  CreateProductInput,
  PeriodQuery,
  ProductSort,
  UpdateProductInput,
} from '@nodex/shared';
import { productsApi } from '../api';

export function useProducts(
  period: PeriodQuery,
  search: string,
  sort: ProductSort,
  limit: number,
) {
  return useQuery({
    queryKey: ['products', period, search, sort, limit],
    queryFn: () => productsApi.list(period, search, sort, limit),
  });
}

export function useProduct(id: number, period: PeriodQuery) {
  return useQuery({
    queryKey: ['product', id, period],
    enabled: Number.isFinite(id) && id > 0,
    queryFn: () => productsApi.get(id, period),
  });
}

export function useProductSearch(search: string, enabled: boolean) {
  return useQuery({
    queryKey: ['product-search', search],
    enabled,
    queryFn: () => productsApi.search(search),
  });
}

export function useCreateProduct() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateProductInput) => productsApi.create(input),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['products'] });
      void qc.invalidateQueries({ queryKey: ['product-search'] });
    },
  });
}

export function useUpdateProduct() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: number; input: UpdateProductInput }) =>
      productsApi.update(id, input),
    onSuccess: () => void qc.invalidateQueries(),
  });
}

export function useDeleteProduct() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => productsApi.remove(id),
    onSuccess: () => void qc.invalidateQueries(),
  });
}

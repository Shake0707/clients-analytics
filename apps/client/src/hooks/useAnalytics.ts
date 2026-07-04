import { useQuery } from '@tanstack/react-query';
import type { PeriodQuery, ProductSort } from '@nodex/shared';
import { analyticsApi } from '../api';

export function useDashboard(period: PeriodQuery) {
  return useQuery({
    queryKey: ['dashboard', period],
    queryFn: () => analyticsApi.dashboard(period),
  });
}

export function useTopClients(period: PeriodQuery) {
  return useQuery({
    queryKey: ['top-clients', period],
    queryFn: () => analyticsApi.topClients(period),
  });
}

export function useTopProducts(period: PeriodQuery, sort: ProductSort) {
  return useQuery({
    queryKey: ['top-products', period, sort],
    queryFn: () => analyticsApi.topProducts(period, sort),
  });
}

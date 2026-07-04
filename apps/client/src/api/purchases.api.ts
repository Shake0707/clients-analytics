import type {
  CreateSaleInput,
  Paginated,
  PeriodQuery,
  SaleDetail,
  SaleListItem,
  UpdateSaleInput,
} from '@nodex/shared';
import { http, periodParams } from './http';

/** Сервис продаж (§4.4, §4.5). */
class PurchasesApi {
  list(period: PeriodQuery, search: string, limit: number): Promise<Paginated<SaleListItem>> {
    return http.get<Paginated<SaleListItem>>('/purchases', {
      params: { ...periodParams(period), search, limit },
    });
  }

  get(id: number): Promise<SaleDetail> {
    return http.get<SaleDetail>(`/purchases/${id}`);
  }

  create(input: CreateSaleInput): Promise<{ id: number }> {
    return http.post<{ id: number }>('/purchases', input);
  }

  update(id: number, input: UpdateSaleInput): Promise<{ id: number }> {
    return http.patch<{ id: number }>(`/purchases/${id}`, input);
  }

  remove(id: number): Promise<{ id: number }> {
    return http.delete<{ id: number }>(`/purchases/${id}`);
  }
}

export const purchasesApi = new PurchasesApi();

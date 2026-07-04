import type {
  CreateProductInput,
  Paginated,
  PeriodQuery,
  ProductDetail,
  ProductListItem,
  ProductSort,
  UpdateProductInput,
} from '@nodex/shared';
import { http, periodParams } from './http';

/** Сервис товаров (§4.6, §4.7). */
class ProductsApi {
  list(
    period: PeriodQuery,
    search: string,
    sort: ProductSort,
    limit: number,
  ): Promise<Paginated<ProductListItem>> {
    return http.get<Paginated<ProductListItem>>('/products', {
      params: { ...periodParams(period), search, sort, limit },
    });
  }

  get(id: number, period: PeriodQuery): Promise<ProductDetail> {
    return http.get<ProductDetail>(`/products/${id}`, { params: periodParams(period) });
  }

  /** Быстрый поиск для экрана продажи. */
  search(search: string): Promise<Paginated<ProductListItem>> {
    return http.get<Paginated<ProductListItem>>('/products', { params: { search, limit: 6 } });
  }

  create(input: CreateProductInput): Promise<{ id: number }> {
    return http.post<{ id: number }>('/products', input);
  }

  update(id: number, input: UpdateProductInput): Promise<{ id: number }> {
    return http.patch<{ id: number }>(`/products/${id}`, input);
  }

  remove(id: number): Promise<{ id: number; softDeleted: boolean }> {
    return http.delete<{ id: number; softDeleted: boolean }>(`/products/${id}`);
  }
}

export const productsApi = new ProductsApi();

import type {
  DashboardResponse,
  PeriodQuery,
  ProductSort,
  TopClientsResponse,
  TopProductsResponse,
} from '@nodex/shared';
import { http, periodParams } from './http';

/** Сервис аналитики (§4.1, §8). */
class AnalyticsApi {
  dashboard(period: PeriodQuery): Promise<DashboardResponse> {
    return http.get<DashboardResponse>('/analytics/dashboard', { params: periodParams(period) });
  }

  topClients(period: PeriodQuery): Promise<TopClientsResponse> {
    return http.get<TopClientsResponse>('/analytics/top-clients', { params: periodParams(period) });
  }

  topProducts(period: PeriodQuery, sort: ProductSort): Promise<TopProductsResponse> {
    return http.get<TopProductsResponse>('/analytics/top-products', {
      params: { ...periodParams(period), sort },
    });
  }
}

export const analyticsApi = new AnalyticsApi();

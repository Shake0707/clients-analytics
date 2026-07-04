import type {
  ClientDetail,
  ClientListItem,
  CreateClientInput,
  Paginated,
  PeriodQuery,
  UpdateClientInput,
} from '@nodex/shared';
import { http, periodParams } from './http';

/** Сервис клиентов (§4.2, §4.3). */
class ClientsApi {
  list(period: PeriodQuery, search: string, limit: number): Promise<Paginated<ClientListItem>> {
    return http.get<Paginated<ClientListItem>>('/clients', {
      params: { ...periodParams(period), search, limit },
    });
  }

  get(id: number, period: PeriodQuery): Promise<ClientDetail> {
    return http.get<ClientDetail>(`/clients/${id}`, { params: periodParams(period) });
  }

  /** Быстрый поиск для экрана продажи. */
  search(search: string): Promise<Paginated<ClientListItem>> {
    return http.get<Paginated<ClientListItem>>('/clients', { params: { search, limit: 5 } });
  }

  create(input: CreateClientInput): Promise<{ id: number }> {
    return http.post<{ id: number }>('/clients', input);
  }

  update(id: number, input: UpdateClientInput): Promise<{ id: number }> {
    return http.patch<{ id: number }>(`/clients/${id}`, input);
  }

  remove(id: number): Promise<{ id: number }> {
    return http.delete<{ id: number }>(`/clients/${id}`);
  }
}

export const clientsApi = new ClientsApi();

import axios, { AxiosError, type AxiosRequestConfig } from 'axios';
import type { PeriodQuery } from '@nodex/shared';
import { initDataRaw } from '../lib/telegram';

/** Нормализованная ошибка API (единый контракт для UI). */
export class ApiError extends Error {
  status: number;
  body: { message?: string; existingClientId?: number } & Record<string, unknown>;

  constructor(
    status: number,
    body: { message?: string; existingClientId?: number } & Record<string, unknown>,
  ) {
    super(typeof body?.message === 'string' ? body.message : `HTTP ${status}`);
    this.status = status;
    this.body = body;
  }
}

/** База API. В dev проксируется Vite (см. vite.config.ts) на NestJS. */
const baseURL = (import.meta.env.VITE_API_URL as string | undefined) ?? '/api';

const instance = axios.create({ baseURL });

// Request: Telegram initData + обход ngrok-заглушки.
instance.interceptors.request.use((config) => {
  const initData = initDataRaw();
  if (initData) config.headers.set('Authorization', `tma ${initData}`);
  config.headers.set('ngrok-skip-browser-warning', '1');
  return config;
});

// Response: разворачиваем .data (чтобы сервисам не нужен .then) и сводим ошибки к ApiError.
instance.interceptors.response.use(
  // res.data имеет тип any → совместим с сигнатурой интерцептора; в рантайме возвращаем данные.
  (res) => res.data,
  (error: AxiosError) => {
    if (error.response) {
      const body = (error.response.data ?? {}) as Record<string, unknown>;
      return Promise.reject(new ApiError(error.response.status, body));
    }
    return Promise.reject(new ApiError(0, { message: error.message }));
  },
);

/**
 * Типизированный фасад: методы сразу возвращают `Promise<T>` (данные, а не AxiosResponse),
 * поэтому в сервисах пишем `return http.get<T>(...)` без `.then`.
 */
export const http = {
  get: <T>(url: string, config?: AxiosRequestConfig) =>
    instance.get(url, config) as unknown as Promise<T>,
  post: <T>(url: string, data?: unknown, config?: AxiosRequestConfig) =>
    instance.post(url, data, config) as unknown as Promise<T>,
  patch: <T>(url: string, data?: unknown, config?: AxiosRequestConfig) =>
    instance.patch(url, data, config) as unknown as Promise<T>,
  delete: <T>(url: string, config?: AxiosRequestConfig) =>
    instance.delete(url, config) as unknown as Promise<T>,
};

/** Параметры периода для query-string (общее для сервисов). */
export function periodParams(q: PeriodQuery): Record<string, string | undefined> {
  return q.preset ? { preset: q.preset } : { from: q.from, to: q.to };
}

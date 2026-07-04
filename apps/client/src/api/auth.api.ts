import { http } from './http';

export interface Me {
  telegramId: number | null;
}

/** Сервис авторизации (§2). */
class AuthApi {
  me(): Promise<Me> {
    return http.get<Me>('/auth/me');
  }
}

export const authApi = new AuthApi();

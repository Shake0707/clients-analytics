import { createHmac } from 'node:crypto';

export interface TelegramUser {
  id: number;
  first_name?: string;
  last_name?: string;
  username?: string;
}

export interface InitDataCheck {
  ok: boolean;
  reason?: string;
  user?: TelegramUser;
  authDate?: number;
}

/**
 * Проверка подписи Telegram Mini App initData.
 * Алгоритм (docs Telegram):
 *   secret_key = HMAC_SHA256(key="WebAppData", data=bot_token)
 *   hash       = HMAC_SHA256(key=secret_key, data=data_check_string)
 * data_check_string — пары key=value (кроме hash), отсортированные, через '\n'.
 */
export function verifyInitData(
  initData: string,
  botToken: string,
  ttlSeconds: number,
  now: number = Date.now(),
): InitDataCheck {
  if (!initData) return { ok: false, reason: 'empty initData' };

  const params = new URLSearchParams(initData);
  const hash = params.get('hash');
  if (!hash) return { ok: false, reason: 'no hash' };

  const pairs: string[] = [];
  params.forEach((value, key) => {
    if (key === 'hash') return;
    pairs.push(`${key}=${value}`);
  });
  pairs.sort();
  const dataCheckString = pairs.join('\n');

  const secretKey = createHmac('sha256', 'WebAppData').update(botToken).digest();
  const computed = createHmac('sha256', secretKey)
    .update(dataCheckString)
    .digest('hex');

  if (computed !== hash) return { ok: false, reason: 'bad signature' };

  const authDate = Number(params.get('auth_date') ?? 0);
  if (ttlSeconds > 0 && authDate > 0) {
    const ageSec = Math.floor(now / 1000) - authDate;
    if (ageSec > ttlSeconds) return { ok: false, reason: 'initData expired' };
  }

  let user: TelegramUser | undefined;
  const userRaw = params.get('user');
  if (userRaw) {
    try {
      user = JSON.parse(userRaw) as TelegramUser;
    } catch {
      return { ok: false, reason: 'bad user json' };
    }
  }

  return { ok: true, user, authDate };
}

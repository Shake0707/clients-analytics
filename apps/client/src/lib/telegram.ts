/** Доступ к Telegram WebApp (классический telegram-web-app.js). */
interface TgWebApp {
  initData: string;
  colorScheme: 'light' | 'dark';
  ready: () => void;
  expand: () => void;
  onEvent?: (e: string, cb: () => void) => void;
}

export function tg(): TgWebApp | undefined {
  return (window as unknown as { Telegram?: { WebApp?: TgWebApp } }).Telegram?.WebApp;
}

/** initData для заголовка Authorization: `tma <initData>`. Пусто вне Telegram. */
export function initDataRaw(): string {
  return tg()?.initData ?? '';
}

export function telegramColorScheme(): 'light' | 'dark' | null {
  return tg()?.colorScheme ?? null;
}

export function initTelegram(): void {
  const app = tg();
  if (app) {
    app.ready();
    app.expand();
  }
}

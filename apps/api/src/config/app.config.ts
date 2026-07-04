import { registerAs } from '@nestjs/config';
import type { PeriodPreset } from '@nodex/shared';

/** Настройки §10 ТЗ + Telegram/доступ. Читаются из корневого .env. */
export const appConfig = registerAs('app', () => {
  const adminIds = (process.env.ADMIN_TELEGRAM_IDS ?? '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)
    .map(Number)
    .filter((n) => Number.isFinite(n));

  return {
    clientOrigin: process.env.CLIENT_ORIGIN ?? 'http://localhost:5173',
    tz: process.env.SHOP_TIMEZONE ?? 'Asia/Tashkent',
    weekStart: process.env.WEEK_START ?? 'monday',
    defaultPeriod: (process.env.DEFAULT_PERIOD as PeriodPreset) ?? 'month',
    topLimit: Number(process.env.TOP_LIMIT ?? 5),
    currency: process.env.CURRENCY ?? 'UZS',
    botToken: process.env.BOT_TOKEN ?? '',
    adminIds,
    initDataTtl: Number(process.env.AUTH_INITDATA_TTL ?? 86400),
    devBypass: process.env.AUTH_DEV_BYPASS === '1',
  };
});

export type AppConfig = ReturnType<typeof appConfig>;

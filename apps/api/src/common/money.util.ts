import type { Money } from '@nodex/shared';

/**
 * Приводит денежное значение (Prisma.Decimal | число | строка из $queryRaw)
 * к строке (§5.1 ТЗ). Форматирование/валюта — на клиенте.
 */
export function toMoney(value: unknown): Money {
  if (value == null) return '0';
  if (typeof value === 'string') return value;
  if (typeof value === 'number') return String(value);
  // Prisma.Decimal и pg-numeric имеют toString()
  if (typeof (value as { toString?: unknown }).toString === 'function') {
    return (value as { toString: () => string }).toString();
  }
  return String(value);
}

/** Число из Decimal/строки для арифметики на сервере. */
export function toNum(value: unknown): number {
  if (value == null) return 0;
  if (typeof value === 'number') return value;
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
}

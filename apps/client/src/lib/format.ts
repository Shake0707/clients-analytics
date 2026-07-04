/** Форматтеры денег/чисел (порт `grp/som/compact` дизайна). uz, валюта UZS. */

export function num(v: string | number | null | undefined): number {
  if (v == null) return 0;
  const n = typeof v === 'number' ? v : Number(v);
  return Number.isFinite(n) ? n : 0;
}

export function grp(n: number): string {
  return Math.round(n)
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
}

export function som(n: number): string {
  return `${grp(n)} so'm`;
}

export function compact(n: number): string {
  if (n >= 1e6) return `${(n / 1e6).toFixed(n >= 1e7 ? 0 : 1).replace('.0', '')} mln`;
  if (n >= 1e3) return `${Math.round(n / 1e3)} ming`;
  return String(Math.round(n));
}

// строковые обёртки для Money из API
export const somStr = (v: string | number) => som(num(v));
export const grpStr = (v: string | number) => grp(num(v));
export const compactStr = (v: string | number) => compact(num(v));

/** Только цифры (для полей телефона/цены). */
export function digitsOnly(s: string): string {
  return (s ?? '').replace(/\D/g, '');
}

/** Инициал имени для аватара. */
export function initial(name: string): string {
  return (name.trim().charAt(0) || '?').toUpperCase();
}

/**
 * uz-форматтеры для тултипов графиков (порт `grp/som/compact` дизайна).
 * Тултипы формируются на сервере и приходят вместе с точками (§5.2).
 * v1 — только uz; при добавлении ru формат переедет на клиент.
 */

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

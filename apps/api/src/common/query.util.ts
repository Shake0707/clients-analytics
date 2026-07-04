/** Безопасный разбор limit/offset из query. */
export function parsePaging(
  limit?: string,
  offset?: string,
  defLimit = 8,
  maxLimit = 100,
): { limit: number; offset: number } {
  let l = Number(limit);
  if (!Number.isFinite(l) || l <= 0) l = defLimit;
  l = Math.min(Math.floor(l), maxLimit);
  let o = Number(offset);
  if (!Number.isFinite(o) || o < 0) o = 0;
  return { limit: l, offset: Math.floor(o) };
}

/**
 * Нормализация узбекского номера до +998XXXXXXXXX (§12-F).
 * Принимает любой ввод с цифрами/пробелами/скобками.
 */
export function normalizePhone(input: string): string | null {
  let digits = (input ?? '').replace(/\D/g, '');
  if (digits.startsWith('998')) digits = digits.slice(3);
  else if (digits.startsWith('8') && digits.length === 10) digits = digits.slice(1);
  if (digits.length !== 9) return null;
  return `+998${digits}`;
}

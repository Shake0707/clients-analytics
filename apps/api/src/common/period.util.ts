import type { PeriodPreset, PeriodQuery } from '@nodex/shared';

/**
 * Периоды и бакеты графиков в таймзоне магазина (§12-K).
 * Asia/Tashkent — фиксированный UTC+5 без DST, но смещение считаем через Intl,
 * поэтому код корректен и для DST-зон.
 */

export interface DateRange {
  from: Date;
  to: Date;
}

export type Granularity = 'hour' | 'day' | 'week' | 'month';

export interface Bucket {
  start: Date;
  end: Date;
  label: string;
}

/** Смещение зоны от UTC в минутах (восток > 0) для конкретного момента. */
function tzOffsetMinutes(date: Date, tz: string): number {
  const dtf = new Intl.DateTimeFormat('en-US', {
    timeZone: tz,
    hourCycle: 'h23',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
  const p: Record<string, string> = {};
  for (const part of dtf.formatToParts(date)) p[part.type] = part.value;
  const asUTC = Date.UTC(
    +p.year,
    +p.month - 1,
    +p.day,
    +p.hour,
    +p.minute,
    +p.second,
  );
  return Math.round((asUTC - date.getTime()) / 60000);
}

interface Wall {
  y: number;
  mo: number; // 0-based
  d: number;
  h: number;
  mi: number;
  s: number;
  dow: number; // 0=Sun..6=Sat
}

/** Компоненты настенных часов зоны для момента. */
function wallOf(date: Date, tz: string): Wall {
  const z = new Date(date.getTime() + tzOffsetMinutes(date, tz) * 60000);
  return {
    y: z.getUTCFullYear(),
    mo: z.getUTCMonth(),
    d: z.getUTCDate(),
    h: z.getUTCHours(),
    mi: z.getUTCMinutes(),
    s: z.getUTCSeconds(),
    dow: z.getUTCDay(),
  };
}

/** Реальный момент (UTC) по настенным часам зоны. */
function fromWall(
  y: number,
  mo: number,
  d: number,
  h: number,
  mi: number,
  s: number,
  ms: number,
  tz: string,
): Date {
  const guess = Date.UTC(y, mo, d, h, mi, s, ms);
  const off = tzOffsetMinutes(new Date(guess), tz);
  return new Date(guess - off * 60000);
}

export function startOfDay(date: Date, tz: string): Date {
  const w = wallOf(date, tz);
  return fromWall(w.y, w.mo, w.d, 0, 0, 0, 0, tz);
}

export function endOfDay(date: Date, tz: string): Date {
  const w = wallOf(date, tz);
  return fromWall(w.y, w.mo, w.d, 23, 59, 59, 999, tz);
}

export function addDays(date: Date, n: number): Date {
  return new Date(date.getTime() + n * 86400000);
}

/** Понедельник текущей недели (§12-K, WEEK_START=monday). */
export function startOfWeek(date: Date, tz: string): Date {
  const w = wallOf(date, tz);
  const back = (w.dow + 6) % 7; // 0 если понедельник
  const monday = fromWall(w.y, w.mo, w.d, 0, 0, 0, 0, tz);
  return addDays(monday, -back);
}

export function startOfMonth(date: Date, tz: string): Date {
  const w = wallOf(date, tz);
  return fromWall(w.y, w.mo, 1, 0, 0, 0, 0, tz);
}

/** Разбор ?preset=today|week|month | ?from&to → границы (UTC) в зоне магазина. */
export function resolvePeriod(
  query: PeriodQuery,
  tz: string,
  fallback: PeriodPreset,
  now: Date = new Date(),
): DateRange {
  if (query.from && query.to) {
    return {
      from: startOfDay(new Date(query.from), tz),
      to: endOfDay(new Date(query.to), tz),
    };
  }
  const preset: PeriodPreset = query.preset ?? fallback;
  if (preset === 'today') {
    return { from: startOfDay(now, tz), to: endOfDay(now, tz) };
  }
  if (preset === 'week') {
    return { from: startOfWeek(now, tz), to: endOfDay(now, tz) };
  }
  // month
  return { from: startOfMonth(now, tz), to: endOfDay(now, tz) };
}

const MON = ['yan', 'fev', 'mar', 'apr', 'may', 'iyn', 'iyl', 'avg', 'sen', 'okt', 'noy', 'dek'];
const MONF = ['Yanvar', 'Fevral', 'Mart', 'Aprel', 'May', 'Iyun', 'Iyul', 'Avgust', 'Sentabr', 'Oktabr', 'Noyabr', 'Dekabr'];

export function fmtDayLabel(date: Date, tz: string): string {
  const w = wallOf(date, tz);
  return `${w.d} ${MON[w.mo]}`;
}

/** Человекочитаемая подпись периода для Главной. */
export function periodLabel(
  query: PeriodQuery,
  tz: string,
  fallback: PeriodPreset,
  now: Date = new Date(),
): string {
  if (query.from && query.to) {
    return `${fmtDayLabel(new Date(query.from), tz)} – ${fmtDayLabel(new Date(query.to), tz)}`;
  }
  const preset = query.preset ?? fallback;
  if (preset === 'today') return 'Bugun';
  if (preset === 'week') return 'Shu hafta';
  const w = wallOf(now, tz);
  return `${MONF[w.mo]} ${w.y}`;
}

/**
 * Бакеты графика с авто-гранулярностью (порт `buckets()` дизайна):
 * today→hour(9..20), ≤31 дн→day, ≤183→week, иначе month.
 */
export function buildBuckets(range: DateRange, tz: string): Bucket[] {
  const days =
    Math.round(
      (startOfDay(range.to, tz).getTime() - startOfDay(range.from, tz).getTime()) /
        86400000,
    ) + 1;
  const gran: Granularity =
    days <= 1 ? 'hour' : days <= 31 ? 'day' : days <= 183 ? 'week' : 'month';

  const out: Bucket[] = [];
  if (gran === 'hour') {
    const w = wallOf(range.from, tz);
    for (let hh = 9; hh <= 20; hh++) {
      out.push({
        start: fromWall(w.y, w.mo, w.d, hh, 0, 0, 0, tz),
        end: fromWall(w.y, w.mo, w.d, hh, 59, 59, 999, tz),
        label: `${hh}:00`,
      });
    }
  } else if (gran === 'day') {
    let cur = startOfDay(range.from, tz);
    const end = startOfDay(range.to, tz);
    while (cur.getTime() <= end.getTime()) {
      const w = wallOf(cur, tz);
      out.push({ start: cur, end: endOfDay(cur, tz), label: String(w.d) });
      cur = addDays(cur, 1);
    }
  } else if (gran === 'week') {
    let cur = startOfDay(range.from, tz);
    const end = startOfDay(range.to, tz);
    let i = 1;
    while (cur.getTime() <= end.getTime()) {
      out.push({
        start: cur,
        end: endOfDay(addDays(cur, 6), tz),
        label: `H${i}`,
      });
      cur = addDays(cur, 7);
      i++;
    }
  } else {
    let w = wallOf(range.from, tz);
    const endW = wallOf(range.to, tz);
    let y = w.y;
    let mo = w.mo;
    while (y < endW.y || (y === endW.y && mo <= endW.mo)) {
      const start = fromWall(y, mo, 1, 0, 0, 0, 0, tz);
      const nextMonth = mo === 11 ? { y: y + 1, mo: 0 } : { y, mo: mo + 1 };
      const end = new Date(
        fromWall(nextMonth.y, nextMonth.mo, 1, 0, 0, 0, 0, tz).getTime() - 1,
      );
      out.push({ start, end, label: MON[mo] });
      y = nextMonth.y;
      mo = nextMonth.mo;
    }
  }
  return out;
}

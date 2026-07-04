import { useState, type ReactNode } from 'react';
import type { PeriodQuery } from '@nodex/shared';
import { PeriodContext, type PeriodChoice, type PeriodCtx } from './period-context';

function isoDay(d: Date): string {
  return d.toISOString().slice(0, 10);
}

export function PeriodProvider({ children }: { children: ReactNode }) {
  const now = new Date();
  const monthAgo = new Date(now);
  monthAgo.setDate(monthAgo.getDate() - 30);

  const [choice, setChoice] = useState<PeriodChoice>('month');
  const [from, setFrom] = useState(isoDay(monthAgo));
  const [to, setTo] = useState(isoDay(now));

  // React Compiler мемоизирует автоматически — ручной useMemo не нужен.
  const query: PeriodQuery = choice === 'custom' ? { from, to } : { preset: choice };
  const value: PeriodCtx = { choice, from, to, setChoice, setFrom, setTo, query };

  return <PeriodContext.Provider value={value}>{children}</PeriodContext.Provider>;
}

import { createContext, useContext } from 'react';
import type { PeriodQuery } from '@nodex/shared';

export type PeriodChoice = 'today' | 'week' | 'month' | 'custom';

export interface PeriodCtx {
  choice: PeriodChoice;
  from: string;
  to: string;
  setChoice: (c: PeriodChoice) => void;
  setFrom: (v: string) => void;
  setTo: (v: string) => void;
  /** Параметры для API. */
  query: PeriodQuery;
}

export const PeriodContext = createContext<PeriodCtx | null>(null);

export function usePeriod(): PeriodCtx {
  const ctx = useContext(PeriodContext);
  if (!ctx) throw new Error('usePeriod must be used within PeriodProvider');
  return ctx;
}

import { usePeriod, type PeriodChoice } from '../lib/period-context';
import { uz } from '../i18n/uz';
import { Segmented } from './Segmented';

const items: { key: PeriodChoice; label: string }[] = [
  { key: 'today', label: uz.today },
  { key: 'week', label: uz.week },
  { key: 'month', label: uz.month },
  { key: 'custom', label: uz.custom },
];

const dateInput: React.CSSProperties = {
  flex: 1,
  minWidth: 0,
  padding: '10px 12px',
  fontSize: 13,
  fontFamily: 'inherit',
  color: 'var(--text)',
  background: 'var(--card)',
  border: '1px solid var(--border)',
  borderRadius: 12,
};

export function PeriodSelector() {
  const { choice, from, to, setChoice, setFrom, setTo } = usePeriod();
  return (
    <>
      <div style={{ marginBottom: 14 }}>
        <Segmented items={items} value={choice} onChange={setChoice} />
      </div>
      {choice === 'custom' && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, margin: '-2px 0 14px' }}>
          <input
            type="date"
            value={from}
            onChange={(e) => setFrom(e.target.value)}
            style={dateInput}
          />
          <span style={{ color: 'var(--faint)' }}>—</span>
          <input
            type="date"
            value={to}
            onChange={(e) => setTo(e.target.value)}
            style={dateInput}
          />
        </div>
      )}
    </>
  );
}

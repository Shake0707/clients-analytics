import { Card } from './common';

export interface Stat {
  label: string;
  value: string;
}

/** Сетка статистических карточек (порт cdStats/prStats дизайна). */
export function StatGrid({ stats }: { stats: Stat[] }) {
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit,minmax(112px,1fr))',
        gap: 11,
        marginBottom: 16,
      }}
    >
      {stats.map((s, i) => (
        <Card key={i} style={{ borderRadius: 16, padding: '13px 14px' }}>
          <div style={{ fontSize: 11.5, color: 'var(--muted)', fontWeight: 600 }}>{s.label}</div>
          <div
            style={{
              fontSize: 'clamp(16px,4.4vw,20px)',
              fontWeight: 800,
              marginTop: 8,
              fontVariantNumeric: 'tabular-nums',
            }}
          >
            {s.value}
          </div>
        </Card>
      ))}
    </div>
  );
}

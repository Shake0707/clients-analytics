import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePeriod } from '../lib/period-context';
import { useTheme } from '../lib/theme-context';
import { useDashboard } from '../hooks';
import { compactStr, somStr } from '../lib/format';
import { uz } from '../i18n/uz';
import { Card, Loading, Screen } from '../ui/common';
import { PeriodSelector } from '../ui/PeriodSelector';
import { Segmented } from '../ui/Segmented';
import { Chart } from '../ui/Chart';
import { Badge } from '../ui/Avatar';
import { ThemeIcon } from '../ui/Icons';

const chartSegItems = [
  { key: 'bar' as const, label: uz.segBar },
  { key: 'area' as const, label: uz.segArea },
];

function chartSub(choice: string): string {
  if (choice === 'today') return "Soatlar bo'yicha";
  if (choice === 'week') return "Kunlar bo'yicha";
  if (choice === 'month') return "Kunlar bo'yicha";
  return "Davr bo'yicha";
}

export function Home() {
  const nav = useNavigate();
  const { toggle } = useTheme();
  const { query, choice } = usePeriod();
  const { data, isLoading } = useDashboard(query);
  const [chartType, setChartType] = useState<'bar' | 'area'>('bar');

  return (
    <Screen>
      <div
        style={{
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          gap: 12,
          marginBottom: 16,
        }}
      >
        <div style={{ minWidth: 0 }}>
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.18em', color: 'var(--accent)' }}>
            {uz.brand}
          </div>
          <h1 style={{ margin: '3px 0 0', fontSize: 'clamp(23px,6.4vw,29px)', fontWeight: 800, letterSpacing: '-.025em' }}>
            {uz.homeTitle}
          </h1>
          <div style={{ fontSize: 13, color: 'var(--muted)', marginTop: 3 }}>
            {data?.periodLabel ?? ' '}
          </div>
        </div>
        <button
          onClick={toggle}
          aria-label="Mavzu"
          style={{
            flexShrink: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 42,
            height: 42,
            borderRadius: 13,
            background: 'var(--card)',
            border: '1px solid var(--border)',
            boxShadow: 'var(--shadow)',
            color: 'var(--muted)',
            cursor: 'pointer',
          }}
        >
          <ThemeIcon />
        </button>
      </div>

      <PeriodSelector />

      {isLoading || !data ? (
        <Loading />
      ) : (
        <>
          <div
            style={{
              background: 'linear-gradient(150deg,var(--accent),var(--accent-2))',
              borderRadius: 18,
              boxShadow: 'var(--shadow)',
              padding: 18,
              marginBottom: 12,
              color: '#fff',
            }}
          >
            <div style={{ fontSize: 12, fontWeight: 600, opacity: 0.85 }}>{uz.revenueActual}</div>
            <div
              style={{
                fontSize: 'clamp(28px,8vw,36px)',
                fontWeight: 800,
                letterSpacing: '-.03em',
                marginTop: 6,
                fontVariantNumeric: 'tabular-nums',
              }}
            >
              {somStr(data.kpi.revenue)}
            </div>
            <div style={{ display: 'flex', gap: 16, marginTop: 12, flexWrap: 'wrap' }}>
              <div>
                <div style={{ fontSize: 11, opacity: 0.8 }}>{uz.discounts}</div>
                <div style={{ fontSize: 15, fontWeight: 700, fontVariantNumeric: 'tabular-nums' }}>
                  {somStr(data.kpi.discounts)}
                </div>
              </div>
              <div>
                <div style={{ fontSize: 11, opacity: 0.8 }}>{uz.sales}</div>
                <div style={{ fontSize: 15, fontWeight: 700, fontVariantNumeric: 'tabular-nums' }}>
                  {data.kpi.sales}
                </div>
              </div>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10, marginBottom: 16 }}>
            <KpiMini label={uz.activeClients} value={String(data.kpi.activeClients)} />
            <KpiMini label={uz.avgCheck} value={somStr(data.kpi.avgCheck)} />
            <KpiMini label={uz.newClients} value={String(data.kpi.newClients)} />
          </div>

          <Card style={{ padding: '16px 16px 14px', marginBottom: 16 }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 10, flexWrap: 'wrap' }}>
              <div>
                <div style={{ fontSize: 15, fontWeight: 700 }}>{uz.revenueDynamics}</div>
                <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 2 }}>{chartSub(choice)}</div>
              </div>
              <div style={{ minWidth: 140 }}>
                <Segmented items={chartSegItems} value={chartType} onChange={setChartType} small />
              </div>
            </div>
            <Chart points={data.timeseries} type={chartType} />
            <div style={{ fontSize: 11, color: 'var(--faint)', marginTop: 8, textAlign: 'center' }}>
              {uz.chartHint}
            </div>
          </Card>

          <div style={{ display: 'grid', gap: 12 }}>
            <MiniList
              title={uz.topClients}
              onAll={() => nav('/clients')}
              rows={data.miniClients}
              onRow={(id) => nav(`/clients/${id}`)}
            />
            <MiniList
              title={uz.topProducts}
              onAll={() => nav('/products')}
              rows={data.miniProducts}
              onRow={(id) => nav(`/products/${id}`)}
            />
          </div>
        </>
      )}
    </Screen>
  );
}

function KpiMini({ label, value }: { label: string; value: string }) {
  return (
    <Card style={{ borderRadius: 15, padding: 13 }}>
      <div style={{ fontSize: 11.5, color: 'var(--muted)', fontWeight: 600 }}>{label}</div>
      <div style={{ fontSize: 19, fontWeight: 800, marginTop: 7, fontVariantNumeric: 'tabular-nums' }}>
        {value}
      </div>
    </Card>
  );
}

function MiniList({
  title,
  onAll,
  rows,
  onRow,
}: {
  title: string;
  onAll: () => void;
  rows: { id: number; name: string; value: string }[];
  onRow: (id: number) => void;
}) {
  return (
    <Card style={{ padding: '6px 15px 8px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 2px 4px' }}>
        <div style={{ fontSize: 14, fontWeight: 700 }}>{title}</div>
        <button
          onClick={onAll}
          style={{ background: 'none', border: 'none', color: 'var(--accent)', fontWeight: 600, fontSize: 12, cursor: 'pointer', fontFamily: 'inherit' }}
        >
          {uz.all}
        </button>
      </div>
      {rows.map((r, i) => (
        <button
          key={r.id}
          onClick={() => onRow(r.id)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 11,
            width: '100%',
            textAlign: 'left',
            background: 'none',
            border: 'none',
            borderTop: '1px solid var(--border)',
            padding: '11px 2px',
            cursor: 'pointer',
            color: 'inherit',
            fontFamily: 'inherit',
          }}
        >
          <Badge rank={i + 1} />
          <span style={{ flex: 1, minWidth: 0, fontSize: 13.5, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {r.name}
          </span>
          <span style={{ fontSize: 13.5, fontWeight: 700, fontVariantNumeric: 'tabular-nums' }}>
            {compactStr(r.value)}
          </span>
        </button>
      ))}
    </Card>
  );
}

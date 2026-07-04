import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePeriod } from '../lib/period-context';
import { useDashboard, usePurchases } from '../hooks';
import { compactStr, num } from '../lib/format';
import { uz } from '../i18n/uz';
import { Card, Empty, Loading, PageTitle, Screen, SearchInput } from '../ui/common';
import { PeriodSelector } from '../ui/PeriodSelector';
import { Segmented } from '../ui/Segmented';
import { Chart } from '../ui/Chart';
import { ListRow, ShowMore } from '../ui/ListRow';

const chartSegItems = [
  { key: 'bar' as const, label: uz.segBar },
  { key: 'area' as const, label: uz.segArea },
];

export function Purchases() {
  const nav = useNavigate();
  const { query } = usePeriod();
  const [chartType, setChartType] = useState<'bar' | 'area'>('bar');
  const [search, setSearch] = useState('');
  const [limit, setLimit] = useState(8);

  const dash = useDashboard(query);
  const list = usePurchases(query, search, limit);

  const kpis = dash.data
    ? [
        { label: uz.sortRevenue, value: compactStr(dash.data.kpi.revenue), unit: uz.som },
        { label: uz.discount, value: compactStr(dash.data.kpi.discounts), unit: uz.som },
        { label: uz.sales, value: String(dash.data.kpi.sales), unit: uz.ta },
        { label: uz.avgCheck, value: compactStr(dash.data.kpi.avgCheck), unit: uz.som },
        { label: uz.newClients, value: String(dash.data.kpi.newClients), unit: uz.ta },
      ]
    : [];

  return (
    <Screen>
      <PageTitle title={uz.purchasesTitle} addLabel={uz.saleBtn} onAdd={() => nav('/purchases/new')} />
      <PeriodSelector />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(104px,1fr))', gap: 10, marginBottom: 14 }}>
        {kpis.map((k) => (
          <Card key={k.label} style={{ borderRadius: 15, padding: 13 }}>
            <div style={{ fontSize: 11.5, color: 'var(--muted)', fontWeight: 600 }}>{k.label}</div>
            <div style={{ fontSize: 17, fontWeight: 800, marginTop: 7, fontVariantNumeric: 'tabular-nums' }}>{k.value}</div>
            <div style={{ fontSize: 11, color: 'var(--faint)', marginTop: 2 }}>{k.unit}</div>
          </Card>
        ))}
      </div>

      <Card style={{ padding: '16px 16px 14px', marginBottom: 14 }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 10, flexWrap: 'wrap' }}>
          <div style={{ fontSize: 15, fontWeight: 700 }}>{uz.dynamics}</div>
          <div style={{ minWidth: 140 }}>
            <Segmented items={chartSegItems} value={chartType} onChange={setChartType} small />
          </div>
        </div>
        {dash.data ? <Chart points={dash.data.timeseries} type={chartType} /> : <Loading />}
      </Card>

      <SearchInput value={search} onChange={(v) => { setSearch(v); setLimit(8); }} placeholder={uz.searchByClient} />

      <Card style={{ padding: '2px 16px 8px' }}>
        {!list.data ? (
          <Loading />
        ) : list.data.items.length === 0 ? (
          <Empty>{uz.noSalesPeriod}</Empty>
        ) : (
          <>
            {list.data.items.map((s) => (
              <ListRow
                key={s.id}
                onClick={() => nav(`/purchases/${s.id}`)}
                title={s.clientName}
                sub={`${s.date} · ${s.positions} ${uz.pcs}`}
                value={compactStr(s.soldPrice)}
                value2={num(s.discount) > 0 ? `−${compactStr(s.discount)}` : undefined}
                value2Color="var(--up)"
              />
            ))}
            <ShowMore show={list.data.total > list.data.items.length} onClick={() => setLimit((l) => l + 8)} />
          </>
        )}
      </Card>
    </Screen>
  );
}

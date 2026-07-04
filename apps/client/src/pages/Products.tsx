import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { ProductSort } from '@nodex/shared';
import { usePeriod } from '../lib/period-context';
import { useProducts, useTopProducts } from '../hooks';
import { compactStr, grp, grpStr, num, somStr } from '../lib/format';
import { uz } from '../i18n/uz';
import { Card, Empty, Loading, PageTitle, Screen, SearchInput } from '../ui/common';
import { PeriodSelector } from '../ui/PeriodSelector';
import { Segmented } from '../ui/Segmented';
import { Chart } from '../ui/Chart';
import { ListRow, ShowMore } from '../ui/ListRow';

const sortItems = [
  { key: 'revenue' as const, label: uz.sortRevenue },
  { key: 'qty' as const, label: uz.sortQty },
];

export function Products() {
  const nav = useNavigate();
  const { query } = usePeriod();
  const [sort, setSort] = useState<ProductSort>('revenue');
  const [search, setSearch] = useState('');
  const [limit, setLimit] = useState(8);

  const top = useTopProducts(query, sort);
  const list = useProducts(query, search, sort, limit);

  return (
    <Screen>
      <PageTitle title={uz.productsTitle} addLabel={uz.productBtn} onAdd={() => nav('/products/new')} />
      <PeriodSelector />

      <Card style={{ padding: '16px 16px 14px', marginBottom: 14 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, flexWrap: 'wrap' }}>
          <div style={{ fontSize: 14, fontWeight: 700 }}>{uz.topProducts}</div>
          <div style={{ minWidth: 140 }}>
            <Segmented items={sortItems} value={sort} onChange={setSort} small />
          </div>
        </div>
        {top.data ? <Chart points={top.data.bars} type="bar" height={150} /> : <Loading />}
      </Card>

      <SearchInput value={search} onChange={(v) => { setSearch(v); setLimit(8); }} placeholder={uz.searchProduct} />

      <Card style={{ padding: '2px 16px 8px' }}>
        {!list.data ? (
          <Loading />
        ) : list.data.items.length === 0 ? (
          <Empty>{uz.productNotFound}</Empty>
        ) : (
          <>
            {list.data.items.map((p) => (
              <ListRow
                key={p.id}
                onClick={() => nav(`/products/${p.id}`)}
                title={p.name}
                sub={`${somStr(p.price)} · ${uz.priceWord}`}
                value={sort === 'qty' ? `${grpStr(p.qty)} ${uz.dona}` : compactStr(p.revenue)}
                value2={sort === 'qty' ? `${compactStr(p.revenue)} ${uz.som}` : `${grp(num(p.qty))} ${uz.dona}`}
              />
            ))}
            <ShowMore show={list.data.total > list.data.items.length} onClick={() => setLimit((l) => l + 8)} />
          </>
        )}
      </Card>
    </Screen>
  );
}

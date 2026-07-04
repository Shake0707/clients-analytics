import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePeriod } from '../lib/period-context';
import { useClients, useTopClients } from '../hooks';
import { compactStr, num } from '../lib/format';
import { uz } from '../i18n/uz';
import { Card, Empty, Loading, PageTitle, Screen, SearchInput } from '../ui/common';
import { PeriodSelector } from '../ui/PeriodSelector';
import { Chart } from '../ui/Chart';
import { Avatar } from '../ui/Avatar';
import { ListRow, ShowMore } from '../ui/ListRow';

export function Clients() {
  const nav = useNavigate();
  const { query } = usePeriod();
  const [search, setSearch] = useState('');
  const [limit, setLimit] = useState(8);

  const top = useTopClients(query);
  const list = useClients(query, search, limit);

  return (
    <Screen>
      <PageTitle title={uz.clientsTitle} addLabel={uz.clientBtn} onAdd={() => nav('/clients/new')} />
      <PeriodSelector />

      <Card style={{ padding: '16px 16px 12px', marginBottom: 14 }}>
        <div style={{ fontSize: 14, fontWeight: 700 }}>{uz.ratingBySum}</div>
        {top.data ? <Chart points={top.data.bars} type="bar" height={150} /> : <Loading />}
      </Card>

      <SearchInput value={search} onChange={(v) => { setSearch(v); setLimit(8); }} placeholder={uz.searchNameOrPhone} />

      <Card style={{ padding: '2px 16px 8px' }}>
        {!list.data ? (
          <Loading />
        ) : list.data.items.length === 0 ? (
          <Empty>{uz.clientNotFound}</Empty>
        ) : (
          <>
            {list.data.items.map((c) => (
              <ListRow
                key={c.id}
                onClick={() => nav(`/clients/${c.id}`)}
                left={<Avatar name={c.name} />}
                title={c.name}
                sub={c.tel}
                value={num(c.periodSum) ? compactStr(c.periodSum) : '—'}
                value2={c.periodCount ? `${c.periodCount} ${uz.purchasesSuffix}` : uz.noPurchasesWord}
              />
            ))}
            <ShowMore
              show={list.data.total > list.data.items.length}
              onClick={() => setLimit((l) => l + 8)}
            />
          </>
        )}
      </Card>
    </Screen>
  );
}

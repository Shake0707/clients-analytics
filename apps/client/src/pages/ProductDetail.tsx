import { useNavigate, useParams } from 'react-router-dom';
import { usePeriod } from '../lib/period-context';
import { useDeleteProduct, useProduct } from '../hooks';
import { grpStr, somStr } from '../lib/format';
import { uz } from '../i18n/uz';
import { BackButton, Card, Empty, Loading, Screen } from '../ui/common';
import { StatGrid } from '../ui/StatGrid';
import { ListRow } from '../ui/ListRow';
import { EditDeleteRow } from '../ui/EditDeleteRow';
import { useConfirm } from '../ui/confirm-context';

export function ProductDetail() {
  const nav = useNavigate();
  const id = Number(useParams().id);
  const { query } = usePeriod();
  const { data, isLoading } = useProduct(id, query);
  const confirm = useConfirm();
  const del = useDeleteProduct();

  async function onDelete() {
    if (!data) return;
    const ok = await confirm({
      title: uz.delProductTitle,
      message: `«${data.name}» ${uz.delProductMsg}`,
      confirmLabel: uz.confirmDelete,
      danger: true,
    });
    if (!ok) return;
    await del.mutateAsync(id);
    nav('/products');
  }

  if (isLoading || !data) {
    return (
      <Screen>
        <BackButton />
        <Loading />
      </Screen>
    );
  }

  return (
    <Screen>
      <BackButton />
      <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.14em', textTransform: 'uppercase', color: 'var(--muted)' }}>
        {uz.productBtn} · {somStr(data.price)}
      </div>
      <h2 style={{ margin: '3px 0 16px', fontSize: 'clamp(22px,5.6vw,28px)', fontWeight: 800, letterSpacing: '-.02em' }}>
        {data.name}
      </h2>

      <EditDeleteRow
        onEdit={() =>
          nav(`/products/${id}/edit`, { state: { editData: { name: data.name, price: data.price } } })
        }
        onDelete={() => void onDelete()}
      />

      <StatGrid
        stats={[
          { label: uz.soldQty, value: `${grpStr(data.qty)} ${uz.dona}` },
          { label: uz.sortRevenue, value: somStr(data.revenue) },
          { label: uz.sales, value: `${data.salesCount} ${uz.ta}` },
          { label: uz.share, value: `${data.share.toFixed(1)}%` },
        ]}
      />

      <Card style={{ padding: '6px 16px 12px' }}>
        <div style={{ fontSize: 15, fontWeight: 700, padding: '13px 2px 4px' }}>{uz.salesPeriod}</div>
        {data.sales.length === 0 ? (
          <Empty>{uz.noSalesPeriod}</Empty>
        ) : (
          data.sales.map((s) => (
            <ListRow
              key={s.saleId}
              onClick={() => nav(`/purchases/${s.saleId}`)}
              title={`${s.date} · ${s.clientName}`}
              sub={`${s.qty} ${uz.dona}`}
              value={somStr(s.lineSum)}
            />
          ))
        )}
      </Card>
    </Screen>
  );
}

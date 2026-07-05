import { useNavigate, useParams } from 'react-router-dom';
import { useDeleteSale, usePurchase } from '../hooks';
import { grpStr, num, somStr } from '../lib/format';
import { uz } from '../i18n/uz';
import { BackButton, Card, Screen } from '../ui/common';
import { EditDeleteRow } from '../ui/EditDeleteRow';
import { SaleDetailSkeleton } from '../ui/Skeleton';
import { useConfirm } from '../ui/confirm-context';

export function PurchaseDetail() {
  const nav = useNavigate();
  const id = Number(useParams().id);
  const { data, isLoading } = usePurchase(id);
  const confirm = useConfirm();
  const del = useDeleteSale();

  async function onDelete() {
    if (!data) return;
    const ok = await confirm({
      title: uz.delSaleTitle,
      message: `${data.clientName} · ${somStr(data.soldPrice)}. ${uz.delSaleMsgSuffix}`,
      confirmLabel: uz.confirmDelete,
      danger: true,
    });
    if (!ok) return;
    await del.mutateAsync(id);
    nav('/purchases');
  }

  if (isLoading || !data) {
    return (
      <Screen>
        <BackButton />
        <SaleDetailSkeleton />
      </Screen>
    );
  }

  const hasDiscount = num(data.discount) > 0;

  return (
    <Screen>
      <BackButton />
      <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.14em', textTransform: 'uppercase', color: 'var(--muted)' }}>
        {uz.saleWord} · {data.date}
      </div>
      <h2 style={{ margin: '3px 0 16px', fontSize: 'clamp(21px,5.4vw,26px)', fontWeight: 800, letterSpacing: '-.02em' }}>
        {data.clientName}
      </h2>

      <EditDeleteRow
        onEdit={() => nav(`/purchases/${id}/edit`, { state: { editData: data } })}
        onDelete={() => void onDelete()}
      />

      <Card style={{ padding: '6px 16px 8px', marginBottom: 14 }}>
        <div style={{ fontSize: 15, fontWeight: 700, padding: '13px 2px 4px' }}>{uz.composition}</div>
        {data.items.map((it) => (
          <div key={it.productId} style={{ display: 'flex', alignItems: 'center', gap: 12, borderTop: '1px solid var(--border)', padding: '12px 2px' }}>
            <span style={{ flex: 1, minWidth: 0 }}>
              <span style={{ display: 'block', fontSize: 14, fontWeight: 600 }}>{it.name}</span>
              <span style={{ display: 'block', fontSize: 12, color: 'var(--muted)', marginTop: 2 }}>
                {it.quantity} × {grpStr(it.price)}
              </span>
            </span>
            <span style={{ fontSize: 14, fontWeight: 700, fontVariantNumeric: 'tabular-nums' }}>{somStr(it.lineSum)}</span>
          </div>
        ))}
      </Card>

      <Card style={{ borderRadius: 16, padding: '15px 16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13.5, color: 'var(--muted)' }}>
          <span>{uz.calcSum}</span>
          <span style={{ fontVariantNumeric: 'tabular-nums' }}>{somStr(data.subtotal)}</span>
        </div>
        {hasDiscount && (
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13.5, color: 'var(--up)', marginTop: 9, fontWeight: 600 }}>
            <span>{uz.discount}</span>
            <span style={{ fontVariantNumeric: 'tabular-nums' }}>−{somStr(data.discount)}</span>
          </div>
        )}
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 16, fontWeight: 800, marginTop: 11, paddingTop: 11, borderTop: '1px solid var(--border)' }}>
          <span>{uz.sold}</span>
          <span style={{ fontVariantNumeric: 'tabular-nums' }}>{somStr(data.soldPrice)}</span>
        </div>
      </Card>
    </Screen>
  );
}

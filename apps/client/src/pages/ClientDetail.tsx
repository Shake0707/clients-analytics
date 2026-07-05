import { useNavigate, useParams } from 'react-router-dom';
import { usePeriod } from '../lib/period-context';
import { useClient, useDeleteClient } from '../hooks';
import { ApiError } from '../api';
import { somStr } from '../lib/format';
import { uz } from '../i18n/uz';
import { BackButton, Card, Empty, Screen } from '../ui/common';
import { Avatar } from '../ui/Avatar';
import { StatGrid } from '../ui/StatGrid';
import { ListRow } from '../ui/ListRow';
import { EditDeleteRow } from '../ui/EditDeleteRow';
import { DetailSkeleton } from '../ui/Skeleton';
import { useConfirm } from '../ui/confirm-context';

export function ClientDetail() {
  const nav = useNavigate();
  const id = Number(useParams().id);
  const { query } = usePeriod();
  const { data, isLoading } = useClient(id, query);
  const confirm = useConfirm();
  const del = useDeleteClient();

  async function onDelete() {
    if (!data) return;
    const ok = await confirm({
      title: uz.delClientTitle,
      message: `${data.name} ${data.surname ?? ''}`.trim() + ' ' + uz.delClientMsgSuffix,
      confirmLabel: uz.confirmDelete,
      danger: true,
    });
    if (!ok) return;
    try {
      await del.mutateAsync(id);
      nav('/clients');
    } catch (e) {
      if (e instanceof ApiError && e.status === 409) {
        await confirm({
          title: uz.delClientBlockedTitle,
          message: uz.delClientBlockedMsg,
          confirmLabel: uz.understood,
        });
      }
    }
  }

  if (isLoading || !data) {
    return (
      <Screen>
        <BackButton />
        <DetailSkeleton avatar />
      </Screen>
    );
  }

  const fullName = `${data.name} ${data.surname ?? ''}`.trim();

  return (
    <Screen>
      <BackButton />
      <div style={{ display: 'flex', alignItems: 'center', gap: 13, marginBottom: 16 }}>
        <Avatar name={fullName} />
        <div style={{ minWidth: 0 }}>
          <h2 style={{ margin: 0, fontSize: 'clamp(20px,5.4vw,25px)', fontWeight: 800, letterSpacing: '-.02em' }}>
            {fullName}
          </h2>
          <div style={{ fontSize: 13, color: 'var(--muted)', marginTop: 2 }}>{data.tel}</div>
        </div>
      </div>

      <EditDeleteRow
        onEdit={() =>
          nav(`/clients/${id}/edit`, {
            state: { editData: { name: data.name, surname: data.surname, tel: data.tel } },
          })
        }
        onDelete={() => void onDelete()}
      />

      <StatGrid
        stats={[
          { label: uz.periodSum, value: somStr(data.periodSum) },
          { label: uz.purchasesWord, value: `${data.periodCount} ${uz.ta}` },
          { label: uz.allTime, value: somStr(data.totalAmount) },
          { label: uz.last, value: data.lastDate ?? '—' },
        ]}
      />

      <Card style={{ padding: '6px 16px 12px' }}>
        <div style={{ fontSize: 15, fontWeight: 700, padding: '13px 2px 4px' }}>{uz.purchasesPeriod}</div>
        {data.purchases.length === 0 ? (
          <Empty>{uz.noPurchasesPeriod}</Empty>
        ) : (
          data.purchases.map((p) => (
            <ListRow
              key={p.id}
              onClick={() => nav(`/purchases/${p.id}`)}
              title={p.date}
              sub={`${p.positions} ${uz.pcs}`}
              value={somStr(p.soldPrice)}
            />
          ))
        )}
      </Card>
    </Screen>
  );
}

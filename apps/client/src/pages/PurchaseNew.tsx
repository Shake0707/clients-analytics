import { useState, type CSSProperties } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import type { SaleDetail } from '@nodex/shared';
import { useClientSearch, useCreateSale, useProductSearch, useUpdateSale } from '../hooks';
import { ApiError } from '../api';
import { digitsOnly, grp, num } from '../lib/format';
import { uz } from '../i18n/uz';
import { Card, ErrorBox, Screen, SearchInput } from '../ui/common';
import { CancelButton } from '../ui/CancelButton';
import { Avatar } from '../ui/Avatar';
import { CloseIcon, PlusIcon } from '../ui/Icons';

interface Line {
  productId: number;
  name: string;
  unitPrice: number;
  qty: number;
}
interface PickedClient {
  id: number;
  name: string;
  tel: string;
}

const stepLabel: CSSProperties = { fontSize: 12.5, color: 'var(--muted)', fontWeight: 700, marginBottom: 8 };

export function PurchaseNew() {
  const nav = useNavigate();
  const loc = useLocation();
  const params = useParams();
  const editId = params.id ? Number(params.id) : undefined;
  const isEdit = editId != null;

  const createSale = useCreateSale();
  const updateSale = useUpdateSale();

  const state = loc.state as { pickedClient?: PickedClient; editData?: SaleDetail } | null;
  const edit = state?.editData;

  // Начальные значения: правка (из SaleDetail) или создание (пустое / вернувшийся клиент).
  const initClient: PickedClient | null = edit
    ? { id: edit.clientId, name: edit.clientName, tel: edit.clientTel }
    : (state?.pickedClient ?? null);
  const initItems: Line[] = edit
    ? edit.items.map((i) => ({ productId: i.productId, name: i.name, unitPrice: num(i.price), qty: i.quantity }))
    : [];
  const initSubtotal = initItems.reduce((a, l) => a + l.unitPrice * l.qty, 0);
  const initSold = edit ? num(edit.soldPrice) : 0;
  const initTouched = edit ? initSold !== initSubtotal : false;

  const [client, setClient] = useState<PickedClient | null>(initClient);
  const [clientSearch, setClientSearch] = useState('');
  const [saleDate, setSaleDate] = useState(edit ? edit.purchaseDate : new Date().toISOString().slice(0, 10));
  const [productSearch, setProductSearch] = useState('');
  const [items, setItems] = useState<Line[]>(initItems);
  const [actual, setActual] = useState(edit && initTouched ? grp(initSold) : '');
  const [touched, setTouched] = useState(initTouched);
  const [error, setError] = useState('');
  const [dirty, setDirty] = useState(false);

  const clientResults = useClientSearch(clientSearch, !client);
  const productResults = useProductSearch(productSearch, productSearch.trim().length > 0);

  const subtotal = items.reduce((a, l) => a + l.unitPrice * l.qty, 0);
  const enteredNum = parseInt(digitsOnly(actual), 10);
  const actualVal = !touched || actual === '' ? subtotal : Math.min(isNaN(enteredNum) ? 0 : enteredNum, subtotal);
  const discount = subtotal - actualVal;
  const bad = touched && actual !== '' && !isNaN(enteredNum) && enteredNum > subtotal;

  function addItem(p: { id: number; name: string; price: string | number }) {
    setItems((prev) => {
      const ex = prev.find((i) => i.productId === p.id);
      if (ex) return prev.map((i) => (i.productId === p.id ? { ...i, qty: i.qty + 1 } : i));
      return [...prev, { productId: p.id, name: p.name, unitPrice: num(p.price), qty: 1 }];
    });
    setProductSearch('');
    setDirty(true);
  }
  const incItem = (id: number) => { setItems((p) => p.map((i) => (i.productId === id ? { ...i, qty: i.qty + 1 } : i))); setDirty(true); };
  const decItem = (id: number) => { setItems((p) => p.map((i) => (i.productId === id ? { ...i, qty: Math.max(1, i.qty - 1) } : i))); setDirty(true); };
  const removeItem = (id: number) => { setItems((p) => p.filter((i) => i.productId !== id)); setDirty(true); };

  async function save() {
    if (!client) return setError(uz.errPickClient);
    if (items.length === 0) return setError(uz.errPickProduct);
    setError('');
    const input = {
      clientId: client.id,
      purchaseDate: new Date(`${saleDate}T12:00:00`).toISOString(),
      items: items.map((i) => ({ productId: i.productId, quantity: i.qty })),
      soldPrice: actualVal,
    };
    try {
      if (isEdit) {
        await updateSale.mutateAsync({ id: editId, input });
        nav(`/purchases/${editId}`);
        return;
      }
      await createSale.mutateAsync(input);
      nav('/purchases');
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'Xatolik');
    }
  }

  const pending = createSale.isPending || updateSale.isPending;

  return (
    <Screen>
      <CancelButton dirty={dirty} />
      <h1 style={{ margin: '2px 0 16px', fontSize: 'clamp(22px,5.6vw,28px)', fontWeight: 800, letterSpacing: '-.025em' }}>
        {isEdit ? uz.editSaleTitle : uz.saleNewTitle}
      </h1>

      {/* 1 · Клиент */}
      <div style={stepLabel}>{uz.stepClient}</div>
      {client ? (
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 14, boxShadow: 'var(--shadow)', padding: '12px 14px', marginBottom: 16 }}>
          <Avatar name={client.name} />
          <span style={{ flex: 1, minWidth: 0 }}>
            <span style={{ display: 'block', fontSize: 14, fontWeight: 700 }}>{client.name}</span>
            <span style={{ display: 'block', fontSize: 12, color: 'var(--muted)' }}>{client.tel}</span>
          </span>
          <button onClick={() => { setClient(null); setDirty(true); }} style={{ background: 'none', border: 'none', color: 'var(--accent)', fontWeight: 600, fontSize: 13, cursor: 'pointer', fontFamily: 'inherit' }}>
            {uz.change}
          </button>
        </div>
      ) : (
        <div style={{ marginBottom: 16 }}>
          <SearchInput value={clientSearch} onChange={setClientSearch} placeholder={uz.searchPhoneOrName} />
          <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 14, boxShadow: 'var(--shadow)', overflow: 'hidden', marginTop: -4 }}>
            {(clientResults.data?.items ?? []).map((c) => {
              const full = `${c.name} ${c.surname ?? ''}`.trim();
              return (
                <button key={c.id} onClick={() => { setClient({ id: c.id, name: full, tel: c.tel }); setClientSearch(''); setDirty(true); }}
                  style={{ display: 'flex', alignItems: 'center', gap: 11, width: '100%', textAlign: 'left', border: 'none', background: 'none', borderBottom: '1px solid var(--border)', padding: '11px 14px', cursor: 'pointer', color: 'inherit', fontFamily: 'inherit' }}>
                  <Avatar name={full} size={34} />
                  <span style={{ flex: 1, minWidth: 0 }}>
                    <span style={{ display: 'block', fontSize: 13.5, fontWeight: 600 }}>{full}</span>
                    <span style={{ display: 'block', fontSize: 12, color: 'var(--muted)' }}>{c.tel}</span>
                  </span>
                </button>
              );
            })}
            <button onClick={() => nav('/clients/new', { state: { returnTo: '/purchases/new' } })}
              style={{ width: '100%', textAlign: 'left', border: 'none', background: 'none', padding: '12px 14px', color: 'var(--accent)', fontWeight: 600, fontSize: 13.5, cursor: 'pointer', fontFamily: 'inherit' }}>
              {uz.addNewClient}
            </button>
          </div>
        </div>
      )}

      {/* 2 · Дата */}
      <div style={stepLabel}>{uz.stepDate}</div>
      <input type="date" value={saleDate} onChange={(e) => { setSaleDate(e.target.value); setDirty(true); }}
        style={{ width: '100%', padding: '12px 14px', fontSize: 15, fontFamily: 'inherit', color: 'var(--text)', background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 13, boxShadow: 'var(--shadow)', marginBottom: 16 }} />

      {/* 3 · Товары */}
      <div style={stepLabel}>{uz.stepProducts}</div>
      {items.map((l) => (
        <div key={l.productId} style={{ display: 'flex', alignItems: 'center', gap: 10, background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 14, boxShadow: 'var(--shadow)', padding: '11px 12px', marginBottom: 8 }}>
          <span style={{ flex: 1, minWidth: 0 }}>
            <span style={{ display: 'block', fontSize: 14, fontWeight: 600 }}>{l.name}</span>
            <span style={{ display: 'block', fontSize: 12, color: 'var(--muted)' }}>{grp(l.unitPrice)} {uz.som}</span>
          </span>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'var(--card-2)', border: '1px solid var(--border)', borderRadius: 10, padding: 3 }}>
            <StepBtn onClick={() => decItem(l.productId)}>−</StepBtn>
            <span style={{ minWidth: 20, textAlign: 'center', fontSize: 14, fontWeight: 700, fontVariantNumeric: 'tabular-nums' }}>{l.qty}</span>
            <StepBtn onClick={() => incItem(l.productId)}>+</StepBtn>
          </div>
          <span style={{ minWidth: 74, textAlign: 'right', fontSize: 13.5, fontWeight: 700, fontVariantNumeric: 'tabular-nums' }}>{grp(l.unitPrice * l.qty)}</span>
          <button onClick={() => removeItem(l.productId)} style={{ border: 'none', background: 'none', color: 'var(--faint)', cursor: 'pointer', display: 'flex', padding: 2 }}>
            <CloseIcon />
          </button>
        </div>
      ))}
      <SearchInput value={productSearch} onChange={setProductSearch} placeholder={uz.searchProduct} />
      {productSearch.trim() && (productResults.data?.items.length ?? 0) > 0 && (
        <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 14, boxShadow: 'var(--shadow)', overflow: 'hidden', marginTop: -4, marginBottom: 16 }}>
          {productResults.data!.items.map((p) => (
            <button key={p.id} onClick={() => addItem(p)}
              style={{ display: 'flex', alignItems: 'center', gap: 10, width: '100%', textAlign: 'left', border: 'none', background: 'none', borderBottom: '1px solid var(--border)', padding: '11px 14px', cursor: 'pointer', color: 'inherit', fontFamily: 'inherit' }}>
              <span style={{ flex: 1, fontSize: 13.5, fontWeight: 600 }}>{p.name}</span>
              <span style={{ fontSize: 13, color: 'var(--muted)', fontVariantNumeric: 'tabular-nums' }}>{grp(num(p.price))}</span>
              <span style={{ color: 'var(--accent)', display: 'flex' }}><PlusIcon size={18} /></span>
            </button>
          ))}
        </div>
      )}

      {/* Summary */}
      <Card style={{ borderRadius: 16, padding: '15px 16px', marginTop: 6, marginBottom: 14 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: 11, borderBottom: '1px solid var(--border)' }}>
          <span style={{ fontSize: 13.5, color: 'var(--muted)' }}>{uz.calcSum}</span>
          <span style={{ fontSize: 16, fontWeight: 700, fontVariantNumeric: 'tabular-nums', color: 'var(--muted)' }}>{grp(subtotal)} {uz.som}</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, marginTop: 12 }}>
          <span style={{ fontSize: 13.5, fontWeight: 600 }}>{uz.howMuchSold}</span>
          <input value={touched ? actual : subtotal ? grp(subtotal) : ''} inputMode="numeric"
            onChange={(e) => { setActual(e.target.value); setTouched(true); setDirty(true); }}
            style={{ width: 150, textAlign: 'right', padding: '10px 12px', fontSize: 16, fontWeight: 700, fontFamily: 'inherit', fontVariantNumeric: 'tabular-nums', color: bad ? 'var(--down)' : 'var(--text)', background: 'var(--card-2)', border: `1px solid ${bad ? 'var(--down)' : 'var(--border)'}`, borderRadius: 11 }} />
        </div>
        {discount > 0 && (
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 10, fontSize: 13 }}>
            <span style={{ color: 'var(--up)', fontWeight: 600 }}>{uz.discount} ({Math.round((discount / subtotal) * 100)}%)</span>
            <span style={{ color: 'var(--up)', fontWeight: 700, fontVariantNumeric: 'tabular-nums' }}>−{grp(discount)} {uz.som}</span>
          </div>
        )}
        <div style={{ fontSize: 11.5, color: 'var(--faint)', marginTop: 9 }}>{uz.saleHint}</div>
      </Card>

      {error && <div style={{ marginBottom: 12 }}><ErrorBox>{error}</ErrorBox></div>}
      <button onClick={() => void save()} disabled={pending}
        style={{ width: '100%', background: 'var(--accent)', color: '#fff', border: 'none', borderRadius: 14, padding: 15, fontSize: 15, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', boxShadow: 'var(--shadow)', opacity: pending ? 0.6 : 1 }}>
        {isEdit ? uz.saveChanges : uz.saveSale}
      </button>
    </Screen>
  );
}

function StepBtn({ children, onClick }: { children: React.ReactNode; onClick: () => void }) {
  return (
    <button onClick={onClick} style={{ width: 26, height: 26, border: 'none', background: 'none', color: 'var(--text)', fontSize: 18, cursor: 'pointer', borderRadius: 7, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      {children}
    </button>
  );
}

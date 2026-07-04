import { useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { useCreateProduct, useUpdateProduct } from '../hooks';
import { ApiError } from '../api';
import { digitsOnly } from '../lib/format';
import { uz } from '../i18n/uz';
import { ErrorBox, Field, PrimaryButton, Screen } from '../ui/common';
import { CancelButton } from '../ui/CancelButton';

interface EditData {
  name: string;
  price: string;
}

export function ProductNew() {
  const nav = useNavigate();
  const loc = useLocation();
  const params = useParams();
  const editId = params.id ? Number(params.id) : undefined;
  const isEdit = editId != null;

  const create = useCreateProduct();
  const update = useUpdateProduct();

  const init = (loc.state as { editData?: EditData } | null)?.editData;

  const [name, setName] = useState(init?.name ?? '');
  const [price, setPrice] = useState(init ? digitsOnly(init.price) : '');
  const [error, setError] = useState('');
  const [dirty, setDirty] = useState(false);

  async function save() {
    if (!name.trim()) return setError(uz.errPNameReq);
    const p = parseInt(digitsOnly(price), 10);
    if (!(p >= 0)) return setError(uz.errPriceBad);
    setError('');
    try {
      if (isEdit) {
        await update.mutateAsync({ id: editId, input: { name: name.trim(), price: p } });
        nav(`/products/${editId}`);
        return;
      }
      await create.mutateAsync({ name: name.trim(), price: p });
      nav('/products');
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'Xatolik');
    }
  }

  const set = (fn: (v: string) => void) => (v: string) => {
    fn(v);
    setDirty(true);
  };

  return (
    <Screen>
      <CancelButton dirty={dirty} />
      <h1 style={{ margin: '2px 0 18px', fontSize: 'clamp(22px,5.6vw,28px)', fontWeight: 800, letterSpacing: '-.025em' }}>
        {isEdit ? uz.editProductTitle : uz.productNewTitle}
      </h1>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <Field label={uz.fieldPName} value={name} onChange={set(setName)} placeholder={uz.phPName} />
        <Field label={uz.fieldPPrice} value={price} onChange={set(setPrice)} placeholder="0" inputMode="numeric" />
        {error && <ErrorBox>{error}</ErrorBox>}
        <div style={{ marginTop: 4 }}>
          <PrimaryButton onClick={() => void save()} disabled={create.isPending || update.isPending}>
            {isEdit ? uz.saveChanges : uz.save}
          </PrimaryButton>
        </div>
      </div>
    </Screen>
  );
}

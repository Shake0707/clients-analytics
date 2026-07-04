import { useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { useCreateClient, useUpdateClient } from '../hooks';
import { ApiError } from '../api';
import { uz } from '../i18n/uz';
import { ErrorBox, Field, PrimaryButton, Screen } from '../ui/common';
import { CancelButton } from '../ui/CancelButton';

interface EditData {
  name: string;
  surname: string | null;
  tel: string;
}

export function ClientNew() {
  const nav = useNavigate();
  const loc = useLocation();
  const params = useParams();
  const editId = params.id ? Number(params.id) : undefined;
  const isEdit = editId != null;

  const create = useCreateClient();
  const update = useUpdateClient();

  const state = loc.state as { returnTo?: string; editData?: EditData } | null;
  const init = state?.editData;

  const [name, setName] = useState(init?.name ?? '');
  const [surname, setSurname] = useState(init?.surname ?? '');
  const [tel, setTel] = useState(init?.tel ?? '');
  const [error, setError] = useState('');
  const [dirty, setDirty] = useState(false);

  const returnTo = state?.returnTo;

  async function save() {
    if (!name.trim()) return setError(uz.errNameReq);
    if (!tel.trim()) return setError(uz.errPhoneReq);
    setError('');
    try {
      const input = { name: name.trim(), surname: surname.trim() || undefined, telNumber: tel };
      if (isEdit) {
        await update.mutateAsync({ id: editId, input });
        nav(`/clients/${editId}`);
        return;
      }
      const res = await create.mutateAsync(input);
      if (returnTo) {
        const pickedClient = { id: res.id, name: `${name.trim()} ${surname.trim()}`.trim(), tel: tel.trim() };
        nav(returnTo, { state: { pickedClient } });
      } else nav('/clients');
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
        {isEdit ? uz.editClientTitle : uz.clientNewTitle}
      </h1>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <Field label={uz.fieldName} value={name} onChange={set(setName)} placeholder={uz.phName} />
        <Field label={uz.fieldSurname} value={surname} onChange={set(setSurname)} placeholder={uz.optional} />
        <Field label={uz.fieldPhone} value={tel} onChange={set(setTel)} placeholder={uz.phPhone} inputMode="tel" />
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

import { useNavigate } from 'react-router-dom';
import { uz } from '../i18n/uz';
import { BackIcon } from './Icons';
import { useConfirm } from './confirm-context';

/** «Bekor qilish» на формах: при изменённых полях спрашивает подтверждение (§4.8). */
export function CancelButton({ dirty }: { dirty: boolean }) {
  const nav = useNavigate();
  const confirm = useConfirm();

  async function cancel() {
    if (dirty) {
      const ok = await confirm({
        title: uz.cancelChangesTitle,
        message: uz.cancelChangesMsg,
        confirmLabel: uz.cancelChangesYes,
        danger: true,
      });
      if (!ok) return;
    }
    nav(-1);
  }

  return (
    <button
      onClick={() => void cancel()}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 5,
        background: 'none',
        border: 'none',
        color: 'var(--accent)',
        fontWeight: 600,
        fontSize: 14,
        cursor: 'pointer',
        padding: '6px 2px',
        marginBottom: 10,
        fontFamily: 'inherit',
      }}
    >
      <BackIcon /> {uz.cancel}
    </button>
  );
}

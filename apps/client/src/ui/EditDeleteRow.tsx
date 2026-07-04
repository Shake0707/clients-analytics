import { uz } from '../i18n/uz';
import { EditIcon, TrashIcon } from './Icons';

/** Ряд кнопок «Tahrirlash / O'chirish» на карточках (§4.8). */
export function EditDeleteRow({ onEdit, onDelete }: { onEdit: () => void; onDelete: () => void }) {
  return (
    <div style={{ display: 'flex', gap: 10, marginBottom: 16 }}>
      <button
        onClick={onEdit}
        style={{
          flex: 1,
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 6,
          background: 'var(--card)',
          color: 'var(--text)',
          border: '1px solid var(--border)',
          borderRadius: 13,
          padding: 11,
          fontSize: 13.5,
          fontWeight: 700,
          cursor: 'pointer',
          fontFamily: 'inherit',
          boxShadow: 'var(--shadow)',
        }}
      >
        <EditIcon /> {uz.edit}
      </button>
      <button
        onClick={onDelete}
        style={{
          flex: 1,
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 6,
          background: 'var(--down-soft)',
          color: 'var(--down)',
          border: 'none',
          borderRadius: 13,
          padding: 11,
          fontSize: 13.5,
          fontWeight: 700,
          cursor: 'pointer',
          fontFamily: 'inherit',
        }}
      >
        <TrashIcon /> {uz.deleteLabel}
      </button>
    </div>
  );
}

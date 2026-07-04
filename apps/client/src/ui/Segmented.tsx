import type { CSSProperties } from 'react';

export interface SegItem<K extends string> {
  key: K;
  label: string;
}

interface Props<K extends string> {
  items: SegItem<K>[];
  value: K;
  onChange: (key: K) => void;
  small?: boolean;
}

/** Сегмент-контрол (порт `seg()` дизайна): периоды, тип графика, сортировка. */
export function Segmented<K extends string>({ items, value, onChange, small }: Props<K>) {
  return (
    <div
      style={{
        display: 'flex',
        gap: small ? 3 : 4,
        padding: small ? 3 : 4,
        background: 'var(--card-2)',
        border: '1px solid var(--border)',
        borderRadius: small ? 10 : 14,
      }}
    >
      {items.map((it) => {
        const activeS = it.key === value;
        const style: CSSProperties = {
          flex: 1,
          textAlign: 'center',
          whiteSpace: 'nowrap',
          cursor: 'pointer',
          padding: small ? '6px 10px' : '9px 6px',
          fontSize: small ? 12 : 13,
          fontWeight: 600,
          fontFamily: 'inherit',
          border: 'none',
          borderRadius: small ? 8 : 10,
          background: activeS ? 'var(--card)' : 'transparent',
          color: activeS ? 'var(--text)' : 'var(--muted)',
          boxShadow: activeS ? 'var(--shadow)' : 'none',
          transition: 'background .15s,color .15s',
        };
        return (
          <button key={it.key} onClick={() => onChange(it.key)} style={style}>
            {it.label}
          </button>
        );
      })}
    </div>
  );
}

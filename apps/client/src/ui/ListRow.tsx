import type { ReactNode } from 'react';
import { uz } from '../i18n/uz';

interface RowProps {
  onClick?: () => void;
  left?: ReactNode;
  title: string;
  sub?: string;
  value?: string;
  value2?: string;
  value2Color?: string;
}

/** Строка списка (порт разметки строк дизайна): [аватар] заголовок/суб — значение/значение2. */
export function ListRow({ onClick, left, title, sub, value, value2, value2Color }: RowProps) {
  return (
    <button
      onClick={onClick}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        width: '100%',
        textAlign: 'left',
        background: 'none',
        border: 'none',
        borderTop: '1px solid var(--border)',
        padding: '12px 2px',
        cursor: onClick ? 'pointer' : 'default',
        color: 'inherit',
        fontFamily: 'inherit',
      }}
    >
      {left}
      <span style={{ flex: 1, minWidth: 0 }}>
        <span
          style={{
            display: 'block',
            fontSize: 14,
            fontWeight: 600,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {title}
        </span>
        {sub != null && (
          <span style={{ display: 'block', fontSize: 12, color: 'var(--muted)', marginTop: 2 }}>{sub}</span>
        )}
      </span>
      {(value != null || value2 != null) && (
        <span style={{ textAlign: 'right' }}>
          {value != null && (
            <span style={{ display: 'block', fontSize: 14, fontWeight: 700, fontVariantNumeric: 'tabular-nums' }}>
              {value}
            </span>
          )}
          {value2 != null && (
            <span
              style={{
                display: 'block',
                fontSize: 11,
                marginTop: 2,
                fontWeight: 600,
                color: value2Color ?? 'var(--faint)',
                fontVariantNumeric: 'tabular-nums',
              }}
            >
              {value2}
            </span>
          )}
        </span>
      )}
    </button>
  );
}

export function ShowMore({ show, onClick }: { show: boolean; onClick: () => void }) {
  if (!show) return null;
  return (
    <button
      onClick={onClick}
      style={{
        width: '100%',
        background: 'none',
        border: 'none',
        borderTop: '1px solid var(--border)',
        padding: 12,
        color: 'var(--accent)',
        fontWeight: 600,
        fontSize: 13,
        cursor: 'pointer',
        fontFamily: 'inherit',
      }}
    >
      {uz.showMore}
    </button>
  );
}

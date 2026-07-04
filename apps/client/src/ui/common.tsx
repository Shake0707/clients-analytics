import type { CSSProperties, ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { uz } from '../i18n/uz';
import { BackIcon, PlusIcon, SearchIcon } from './Icons';

const cardStyle: CSSProperties = {
  background: 'var(--card)',
  border: '1px solid var(--border)',
  borderRadius: 18,
  boxShadow: 'var(--shadow)',
};

export function Card({ children, style }: { children: ReactNode; style?: CSSProperties }) {
  return <div style={{ ...cardStyle, ...style }}>{children}</div>;
}

export function Screen({ children }: { children: ReactNode }) {
  return <div style={{ animation: 'fadeUp .3s ease both' }}>{children}</div>;
}

export function BackButton() {
  const nav = useNavigate();
  return (
    <button
      onClick={() => nav(-1)}
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
      <BackIcon /> {uz.back}
    </button>
  );
}

export function PageTitle({
  title,
  onAdd,
  addLabel,
}: {
  title: string;
  onAdd?: () => void;
  addLabel?: string;
}) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 10,
        marginBottom: 14,
      }}
    >
      <h1
        style={{
          margin: 0,
          fontSize: 'clamp(22px,6vw,28px)',
          fontWeight: 800,
          letterSpacing: '-.025em',
        }}
      >
        {title}
      </h1>
      {onAdd && (
        <button
          onClick={onAdd}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 5,
            background: 'var(--accent)',
            color: '#fff',
            border: 'none',
            borderRadius: 12,
            padding: '10px 14px',
            fontSize: 13,
            fontWeight: 700,
            cursor: 'pointer',
            fontFamily: 'inherit',
            boxShadow: 'var(--shadow)',
          }}
        >
          <PlusIcon /> {addLabel}
        </button>
      )}
    </div>
  );
}

export function PrimaryButton({
  children,
  onClick,
  disabled,
}: {
  children: ReactNode;
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        width: '100%',
        background: 'var(--accent)',
        color: '#fff',
        border: 'none',
        borderRadius: 14,
        padding: 15,
        fontSize: 15,
        fontWeight: 700,
        cursor: disabled ? 'default' : 'pointer',
        opacity: disabled ? 0.55 : 1,
        fontFamily: 'inherit',
        boxShadow: 'var(--shadow)',
      }}
    >
      {children}
    </button>
  );
}

export function Field({
  label,
  value,
  onChange,
  placeholder,
  inputMode,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  inputMode?: 'text' | 'tel' | 'numeric';
}) {
  return (
    <label style={{ display: 'block' }}>
      <span
        style={{
          display: 'block',
          fontSize: 12.5,
          color: 'var(--muted)',
          fontWeight: 600,
          marginBottom: 7,
        }}
      >
        {label}
      </span>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        inputMode={inputMode}
        style={{
          width: '100%',
          padding: '13px 14px',
          fontSize: 15,
          fontFamily: 'inherit',
          color: 'var(--text)',
          background: 'var(--card)',
          border: '1px solid var(--border)',
          borderRadius: 13,
          boxShadow: 'var(--shadow)',
        }}
      />
    </label>
  );
}

export function SearchInput({
  value,
  onChange,
  placeholder,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
}) {
  return (
    <div style={{ position: 'relative', marginBottom: 12 }}>
      <span
        style={{
          position: 'absolute',
          left: 13,
          top: '50%',
          transform: 'translateY(-50%)',
          color: 'var(--faint)',
          display: 'flex',
        }}
      >
        <SearchIcon />
      </span>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        style={{
          width: '100%',
          padding: '12px 14px 12px 38px',
          fontSize: 14,
          fontFamily: 'inherit',
          color: 'var(--text)',
          background: 'var(--card)',
          border: '1px solid var(--border)',
          borderRadius: 13,
          boxShadow: 'var(--shadow)',
        }}
      />
    </div>
  );
}

export function ErrorBox({ children }: { children: ReactNode }) {
  return (
    <div
      style={{
        fontSize: 13,
        color: 'var(--down)',
        background: 'var(--down-soft)',
        padding: '11px 13px',
        borderRadius: 11,
      }}
    >
      {children}
    </div>
  );
}

export function Empty({ children }: { children: ReactNode }) {
  return (
    <div style={{ padding: '26px 8px', textAlign: 'center', color: 'var(--muted)', fontSize: 13 }}>
      {children}
    </div>
  );
}

export function Loading() {
  return (
    <div style={{ padding: '40px 8px', textAlign: 'center', color: 'var(--faint)', fontSize: 13 }}>
      …
    </div>
  );
}

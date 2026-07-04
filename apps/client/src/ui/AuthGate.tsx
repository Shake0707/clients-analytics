import { useQuery } from '@tanstack/react-query';
import type { ReactNode } from 'react';
import { ApiError, authApi } from '../api';
import { uz } from '../i18n/uz';

/** Гейт доступа: пускает в приложение только авторизованного админа (§2 ТЗ). */
export function AuthGate({ children }: { children: ReactNode }) {
  const { isLoading, isError, refetch, isFetching } = useQuery({
    queryKey: ['auth-me'],
    queryFn: () => authApi.me(),
    retry: (count, err) =>
      !(err instanceof ApiError && (err.status === 401 || err.status === 403)) && count < 2,
  });

  if (isLoading) return <Splash>{uz.loading}</Splash>;
  if (isError) return <Blocked onRetry={() => void refetch()} busy={isFetching} />;
  return <>{children}</>;
}

function Splash({ children }: { children: ReactNode }) {
  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'var(--faint)',
        fontSize: 14,
        fontFamily: 'Manrope,sans-serif',
      }}
    >
      {children}
    </div>
  );
}

function Blocked({ onRetry, busy }: { onRetry: () => void; busy: boolean }) {
  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 24,
        fontFamily: 'Manrope,sans-serif',
      }}
    >
      <div
        style={{
          maxWidth: 360,
          width: '100%',
          textAlign: 'center',
          background: 'var(--card)',
          border: '1px solid var(--border)',
          borderRadius: 20,
          boxShadow: 'var(--shadow)',
          padding: '32px 24px',
        }}
      >
        <div
          style={{
            width: 56,
            height: 56,
            margin: '0 auto 18px',
            borderRadius: 16,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'var(--down-soft)',
            color: 'var(--down)',
          }}
        >
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round">
            <rect x="4" y="10" width="16" height="10" rx="2" />
            <path d="M8 10V7a4 4 0 0 1 8 0v3" />
          </svg>
        </div>
        <h1 style={{ margin: '0 0 8px', fontSize: 20, fontWeight: 800, color: 'var(--text)' }}>
          {uz.accessDeniedTitle}
        </h1>
        <p style={{ margin: '0 0 20px', fontSize: 14, lineHeight: 1.5, color: 'var(--muted)' }}>
          {uz.accessDeniedText}
        </p>
        <button
          onClick={onRetry}
          disabled={busy}
          style={{
            background: 'var(--accent)',
            color: '#fff',
            border: 'none',
            borderRadius: 12,
            padding: '11px 22px',
            fontSize: 14,
            fontWeight: 700,
            cursor: busy ? 'default' : 'pointer',
            opacity: busy ? 0.6 : 1,
            fontFamily: 'inherit',
          }}
        >
          {uz.retry}
        </button>
      </div>
    </div>
  );
}

import { useState, type ReactNode } from 'react';
import { uz } from '../i18n/uz';
import { ConfirmContext, type Confirm, type ConfirmOptions } from './confirm-context';

interface Pending extends ConfirmOptions {
  resolve: (v: boolean) => void;
}

/** Provider модалки подтверждения (§4.8: удаление/отмена изменений). */
export function ConfirmProvider({ children }: { children: ReactNode }) {
  const [pending, setPending] = useState<Pending | null>(null);

  const confirm: Confirm = (opts) =>
    new Promise<boolean>((resolve) => setPending({ ...opts, resolve }));

  const close = (result: boolean) => {
    if (pending) pending.resolve(result);
    setPending(null);
  };

  return (
    <ConfirmContext.Provider value={confirm}>
      {children}
      {pending && (
        <div
          onClick={() => close(false)}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 60,
            background: 'rgba(8,10,14,.5)',
            backdropFilter: 'blur(2px)',
            WebkitBackdropFilter: 'blur(2px)',
            display: 'flex',
            alignItems: 'flex-end',
            justifyContent: 'center',
            padding: 16,
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              width: '100%',
              maxWidth: 400,
              background: 'var(--card)',
              border: '1px solid var(--border)',
              borderRadius: 20,
              boxShadow: 'var(--shadow)',
              padding: 22,
              marginBottom: 76,
              animation: 'fadeUp .22s ease both',
            }}
          >
            <div style={{ fontSize: 17, fontWeight: 800, letterSpacing: '-.02em' }}>
              {pending.title}
            </div>
            <div style={{ fontSize: 13.5, color: 'var(--muted)', marginTop: 8, lineHeight: 1.5 }}>
              {pending.message}
            </div>
            <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
              {pending.danger && (
                <button
                  onClick={() => close(false)}
                  style={{
                    flex: 1,
                    padding: 13,
                    fontSize: 14.5,
                    fontWeight: 700,
                    fontFamily: 'inherit',
                    cursor: 'pointer',
                    border: '1px solid var(--border)',
                    borderRadius: 12,
                    background: 'var(--card)',
                    color: 'var(--text)',
                  }}
                >
                  {uz.cancel}
                </button>
              )}
              <button
                onClick={() => close(true)}
                style={{
                  flex: 1,
                  padding: 13,
                  fontSize: 14.5,
                  fontWeight: 700,
                  fontFamily: 'inherit',
                  cursor: 'pointer',
                  border: 'none',
                  borderRadius: 12,
                  color: '#fff',
                  background: pending.danger ? 'var(--down)' : 'var(--accent)',
                }}
              >
                {pending.confirmLabel}
              </button>
            </div>
          </div>
        </div>
      )}
    </ConfirmContext.Provider>
  );
}

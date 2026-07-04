import { Outlet } from 'react-router-dom';
import { BottomNav } from './BottomNav';

export function Layout() {
  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', color: 'var(--text)' }}>
      <div
        style={{
          maxWidth: 480,
          margin: '0 auto',
          position: 'relative',
          padding: 'clamp(14px,4vw,20px) clamp(13px,4vw,18px) 96px',
        }}
      >
        <Outlet />
      </div>
      <BottomNav />
    </div>
  );
}

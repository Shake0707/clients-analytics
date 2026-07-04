import { useLocation, useNavigate } from 'react-router-dom';
import { uz } from '../i18n/uz';
import { ClientsIcon, HomeIcon, ProductsIcon, SalesIcon } from './Icons';

type Tab = 'home' | 'clients' | 'purchases' | 'products';

function tabOf(path: string): Tab {
  if (path.startsWith('/clients')) return 'clients';
  if (path.startsWith('/purchases')) return 'purchases';
  if (path.startsWith('/products')) return 'products';
  return 'home';
}

const tabs: { key: Tab; to: string; label: string; Icon: React.FC<{ size?: number }> }[] = [
  { key: 'home', to: '/', label: uz.navHome, Icon: HomeIcon },
  { key: 'clients', to: '/clients', label: uz.navClients, Icon: ClientsIcon },
  { key: 'purchases', to: '/purchases', label: uz.navPurchases, Icon: SalesIcon },
  { key: 'products', to: '/products', label: uz.navProducts, Icon: ProductsIcon },
];

export function BottomNav() {
  const nav = useNavigate();
  const active = tabOf(useLocation().pathname);

  return (
    <div
      style={{
        position: 'fixed',
        left: '50%',
        transform: 'translateX(-50%)',
        bottom: 0,
        width: '100%',
        maxWidth: 480,
        background: 'var(--nav-bg)',
        backdropFilter: 'blur(14px)',
        WebkitBackdropFilter: 'blur(14px)',
        borderTop: '1px solid var(--border)',
        display: 'flex',
        padding: '8px 6px calc(8px + env(safe-area-inset-bottom,0px))',
        zIndex: 40,
      }}
    >
      {tabs.map(({ key, to, label, Icon }) => {
        const on = key === active;
        return (
          <button
            key={key}
            onClick={() => nav(to)}
            style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 3,
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: 4,
              color: on ? 'var(--accent)' : 'var(--muted)',
              fontFamily: 'inherit',
            }}
          >
            <Icon />
            <span style={{ fontSize: 11, fontWeight: 600 }}>{label}</span>
          </button>
        );
      })}
    </div>
  );
}

import type { CSSProperties } from 'react';
import { initial } from '../lib/format';

function hashStr(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return h;
}

/** Аватар с градиентом по хэшу имени (порт `avatar()` дизайна). */
export function Avatar({ name, size = 38 }: { name: string; size?: number }) {
  const hue = hashStr(name) % 360;
  const style: CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: size,
    height: size,
    borderRadius: 11,
    flexShrink: 0,
    fontSize: size * 0.4,
    fontWeight: 700,
    color: '#fff',
    background: `linear-gradient(140deg,hsl(${hue} 55% 55%),hsl(${(hue + 30) % 360} 55% 48%))`,
  };
  return <span style={style}>{initial(name)}</span>;
}

/** Ранговый бейдж (порт `badge()` дизайна). */
export function Badge({ rank }: { rank: number }) {
  const top = rank <= 3;
  const style: CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: 28,
    height: 28,
    borderRadius: 8,
    flexShrink: 0,
    fontSize: 12.5,
    fontWeight: 700,
    fontVariantNumeric: 'tabular-nums',
    background: top ? 'var(--accent-soft)' : 'var(--card-2)',
    color: top ? 'var(--accent)' : 'var(--muted)',
    border: top ? 'none' : '1px solid var(--border)',
  };
  return <span style={style}>{rank}</span>;
}

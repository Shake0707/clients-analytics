import { useState, type CSSProperties } from 'react';
import type { ChartPoint } from '@nodex/shared';
import { useTheme } from '../lib/theme-context';

interface Props {
  points: ChartPoint[];
  type?: 'bar' | 'area';
  height?: number;
}

/**
 * Порт кастомного графика из дизайна: bar/area, сетка, тултип (tap+hover),
 * анти-обрезка тултипа у краёв. Данные тултипа приходят с точками (§5.2).
 */
export function Chart({ points, type = 'bar', height = 178 }: Props) {
  const { theme } = useTheme();
  const [active, setActive] = useState(-1);

  const dark = theme === 'dark';
  const c = {
    grid: dark ? 'rgba(255,255,255,.07)' : 'rgba(16,22,32,.06)',
    label: dark ? '#7b828d' : '#9aa1ab',
    hit: dark ? 'rgba(255,255,255,.05)' : 'rgba(16,22,32,.045)',
  };

  const n = points.length;
  const max = Math.max(1, ...points.map((b) => b.value));
  const grid = [0, 1, 2, 3].map((i) => (
    <div
      key={`g${i}`}
      style={{
        position: 'absolute',
        left: 0,
        right: 0,
        top: `${(i * 100) / 3}%`,
        borderTop: `1px solid ${c.grid}`,
      }}
    />
  ));

  let plot: React.ReactNode;
  if (type === 'area' && n > 0) {
    const pts = points.map((b, i) => [
      n === 1 ? 50 : (i / (n - 1)) * 100,
      100 - Math.max(2, (b.value / max) * 100),
    ]);
    const line = pts
      .map((p, i) => `${i ? 'L' : 'M'}${p[0].toFixed(2)} ${p[1].toFixed(2)}`)
      .join(' ');
    const area = `M${pts[0][0].toFixed(2)} 100 L${pts
      .map((p) => `${p[0].toFixed(2)} ${p[1].toFixed(2)}`)
      .join(' L')} L${pts[n - 1][0].toFixed(2)} 100 Z`;
    plot = (
      <svg
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}
      >
        <defs>
          <linearGradient id="ga-chart" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--accent-2)" stopOpacity={0.3} />
            <stop offset="100%" stopColor="var(--accent-2)" stopOpacity={0} />
          </linearGradient>
        </defs>
        <path d={area} fill="url(#ga-chart)" />
        <path
          d={line}
          fill="none"
          stroke="var(--accent)"
          strokeWidth={2}
          vectorEffect="non-scaling-stroke"
          strokeLinejoin="round"
          strokeLinecap="round"
        />
      </svg>
    );
  } else {
    plot = (
      <div
        style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          alignItems: 'flex-end',
          justifyContent: 'space-between',
          gap: 3,
          padding: '0 2px',
        }}
      >
        {points.map((b, i) => (
          <div
            key={i}
            style={{
              flex: 1,
              minWidth: 0,
              maxWidth: 30,
              margin: '0 auto',
              height: `${Math.max(2.5, (b.value / max) * 100)}%`,
              background: `linear-gradient(180deg,${active === i ? 'var(--accent)' : 'var(--accent-2)'},var(--accent))`,
              borderRadius: '6px 6px 2px 2px',
              transition: 'height .35s',
            }}
          />
        ))}
      </div>
    );
  }

  const hit = (
    <div style={{ position: 'absolute', inset: 0, display: 'flex', gap: 3, padding: '0 2px' }}>
      {points.map((_, i) => (
        <div
          key={i}
          onMouseEnter={() => setActive(i)}
          onMouseLeave={() => setActive(-1)}
          onClick={() => setActive((a) => (a === i ? -1 : i))}
          style={{
            flex: 1,
            cursor: 'pointer',
            borderRadius: 6,
            background: active === i ? c.hit : 'transparent',
          }}
        />
      ))}
    </div>
  );

  let tipBox: React.ReactNode = null;
  if (active >= 0 && active < n) {
    const b = points[active];
    const lp = ((active + 0.5) / n) * 100;
    const pos: CSSProperties =
      lp < 26
        ? { left: 2 }
        : lp > 74
          ? { right: 2 }
          : { left: `${lp}%`, transform: 'translateX(-50%)' };
    tipBox = (
      <div
        style={{
          position: 'absolute',
          top: 4,
          zIndex: 6,
          background: 'var(--tip-bg)',
          color: 'var(--text)',
          border: '1px solid var(--border)',
          borderRadius: 12,
          boxShadow: 'var(--shadow)',
          padding: '9px 11px',
          minWidth: 156,
          maxWidth: 210,
          pointerEvents: 'none',
          ...pos,
        }}
      >
        <div style={{ fontSize: 12, fontWeight: 700, marginBottom: 6 }}>{b.tip.title}</div>
        {b.tip.lines.map((l, k) => (
          <div
            key={k}
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              gap: 12,
              fontSize: 11.5,
              padding: '1.5px 0',
            }}
          >
            <span style={{ color: 'var(--muted)' }}>{l.k}</span>
            <span style={{ fontWeight: 600, fontVariantNumeric: 'tabular-nums', whiteSpace: 'nowrap' }}>
              {l.v}
            </span>
          </div>
        ))}
      </div>
    );
  }

  const step = n <= 8 ? 1 : Math.ceil(n / 6);
  return (
    <div>
      <div style={{ position: 'relative', height, marginTop: 12 }}>
        {grid}
        {plot}
        {hit}
        {tipBox}
      </div>
      <div style={{ display: 'flex', gap: 3, padding: '0 2px', marginTop: 8 }}>
        {points.map((b, i) => (
          <div
            key={i}
            style={{
              flex: 1,
              textAlign: 'center',
              fontSize: 10,
              color: c.label,
              whiteSpace: 'nowrap',
              overflow: 'hidden',
            }}
          >
            {i % step === 0 || i === n - 1 ? b.label : ''}
          </div>
        ))}
      </div>
    </div>
  );
}

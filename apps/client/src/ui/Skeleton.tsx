import type { CSSProperties } from 'react';
import { Card } from './common';

/** Базовый шиммер-блок. */
export function Skel({
  w = '100%',
  h = 14,
  r = 8,
  style,
}: {
  w?: number | string;
  h?: number | string;
  r?: number;
  style?: CSSProperties;
}) {
  return (
    <div
      style={{
        width: w,
        height: h,
        borderRadius: r,
        background: 'linear-gradient(90deg, var(--skel) 0%, var(--skel-hi) 50%, var(--skel) 100%)',
        backgroundSize: '200% 100%',
        animation: 'shimmer 1.4s linear infinite',
        flexShrink: 0,
        ...style,
      }}
    />
  );
}

/** Плейсхолдер графика (фейковые столбцы). */
export function SkelChart({ height = 178 }: { height?: number }) {
  const bars = [46, 74, 58, 88, 50, 70, 62, 92];
  return (
    <div style={{ marginTop: 12 }}>
      <div style={{ height, display: 'flex', alignItems: 'flex-end', gap: 6, padding: '0 2px' }}>
        {bars.map((b, i) => (
          <Skel key={i} h={`${b}%`} r={6} style={{ flex: 1, maxWidth: 30, margin: '0 auto' }} />
        ))}
      </div>
    </div>
  );
}

/** Строки списка (внутри Card). */
export function SkelRows({ rows = 6, avatar = false }: { rows?: number; avatar?: boolean }) {
  return (
    <>
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, borderTop: '1px solid var(--border)', padding: '13px 2px' }}>
          {avatar && <Skel w={38} h={38} r={11} />}
          <div style={{ flex: 1, minWidth: 0 }}>
            <Skel w="55%" h={13} />
            <Skel w="34%" h={11} style={{ marginTop: 7 }} />
          </div>
          <Skel w={52} h={13} />
        </div>
      ))}
    </>
  );
}

/** Сетка KPI-карточек. */
export function SkelKpis({ count = 5, minmax = 104 }: { count?: number; minmax?: number }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: `repeat(auto-fit,minmax(${minmax}px,1fr))`, gap: 10, marginBottom: 14 }}>
      {Array.from({ length: count }).map((_, i) => (
        <Card key={i} style={{ borderRadius: 15, padding: 13 }}>
          <Skel w="70%" h={11} />
          <Skel w="55%" h={17} style={{ marginTop: 9 }} />
        </Card>
      ))}
    </div>
  );
}

/** Сетка стат-карточек (карточки клиента/товара). */
export function SkelStatGrid({ count = 4 }: { count?: number }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(112px,1fr))', gap: 11, marginBottom: 16 }}>
      {Array.from({ length: count }).map((_, i) => (
        <Card key={i} style={{ borderRadius: 16, padding: '13px 14px' }}>
          <Skel w="60%" h={11} />
          <Skel w="80%" h={20} style={{ marginTop: 10 }} />
        </Card>
      ))}
    </div>
  );
}

/** Скелетон Главной. */
export function HomeSkeleton() {
  return (
    <>
      <Card style={{ borderRadius: 18, padding: 18, marginBottom: 12 }}>
        <Skel w={120} h={12} />
        <Skel w={200} h={34} style={{ marginTop: 10 }} />
        <div style={{ display: 'flex', gap: 16, marginTop: 14 }}>
          <Skel w={72} h={30} />
          <Skel w={72} h={30} />
        </div>
      </Card>
      <SkelKpis count={3} minmax={90} />
      <Card style={{ padding: '16px 16px 14px', marginBottom: 16 }}>
        <Skel w={150} h={15} />
        <SkelChart />
      </Card>
      <Card style={{ padding: '10px 15px', marginBottom: 12 }}>
        <SkelRows rows={3} />
      </Card>
      <Card style={{ padding: '10px 15px' }}>
        <SkelRows rows={3} />
      </Card>
    </>
  );
}

/** Скелетон карточки клиента/товара (шапка + кнопки + статы + список). */
export function DetailSkeleton({ avatar = false }: { avatar?: boolean }) {
  return (
    <>
      {avatar ? (
        <div style={{ display: 'flex', alignItems: 'center', gap: 13, marginBottom: 16 }}>
          <Skel w={38} h={38} r={11} />
          <div>
            <Skel w={150} h={22} />
            <Skel w={90} h={12} style={{ marginTop: 8 }} />
          </div>
        </div>
      ) : (
        <div style={{ marginBottom: 16 }}>
          <Skel w={120} h={11} />
          <Skel w={180} h={24} style={{ marginTop: 9 }} />
        </div>
      )}
      <div style={{ display: 'flex', gap: 10, marginBottom: 16 }}>
        <Skel h={42} r={13} style={{ flex: 1 }} />
        <Skel h={42} r={13} style={{ flex: 1 }} />
      </div>
      <SkelStatGrid count={4} />
      <Card style={{ padding: '12px 16px' }}>
        <SkelRows rows={4} />
      </Card>
    </>
  );
}

/** Скелетон деталей продажи (состав + итоги). */
export function SaleDetailSkeleton() {
  return (
    <>
      <div style={{ marginBottom: 16 }}>
        <Skel w={120} h={11} />
        <Skel w={170} h={24} style={{ marginTop: 9 }} />
      </div>
      <div style={{ display: 'flex', gap: 10, marginBottom: 16 }}>
        <Skel h={42} r={13} style={{ flex: 1 }} />
        <Skel h={42} r={13} style={{ flex: 1 }} />
      </div>
      <Card style={{ padding: '12px 16px', marginBottom: 14 }}>
        <SkelRows rows={3} />
      </Card>
      <Card style={{ borderRadius: 16, padding: '15px 16px' }}>
        <Skel w="100%" h={14} />
        <Skel w="100%" h={14} style={{ marginTop: 12 }} />
        <Skel w="100%" h={18} style={{ marginTop: 14 }} />
      </Card>
    </>
  );
}

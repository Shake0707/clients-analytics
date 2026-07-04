import { Inject, Injectable } from '@nestjs/common';
import type { ConfigType } from '@nestjs/config';
import type {
  ChartPoint,
  DashboardResponse,
  MiniRankItem,
  PeriodQuery,
  ProductSort,
  TopClientItem,
  TopClientsResponse,
  TopProductItem,
  TopProductsResponse,
  TimeseriesResponse,
} from '@nodex/shared';
import { appConfig } from '../config/app.config';
import {
  buildBuckets,
  fmtDayLabel,
  periodLabel as periodLabelFn,
  resolvePeriod,
  type DateRange,
} from '../common/period.util';
import { grp, som } from '../common/format.util';
import { toMoney, toNum } from '../common/money.util';
import { PrismaService } from '../prisma/prisma.service';

interface LoadedItem {
  productId: number;
  quantity: number;
  price: unknown;
}
interface LoadedSale {
  id: number;
  clientId: number;
  price: unknown;
  purchaseDate: Date;
  items: LoadedItem[];
  client: { name: string; surname: string | null };
}
interface Kpi {
  net: number;
  gross: number;
  disc: number;
  count: number;
  clients: number;
  avg: number;
}

@Injectable()
export class AnalyticsService {
  constructor(
    private readonly prisma: PrismaService,
    @Inject(appConfig.KEY) private readonly config: ConfigType<typeof appConfig>,
  ) {}

  private range(query: PeriodQuery): DateRange {
    return resolvePeriod(query, this.config.tz, this.config.defaultPeriod);
  }

  private loadSales(range: DateRange): Promise<LoadedSale[]> {
    return this.prisma.purchased.findMany({
      where: { purchaseDate: { gte: range.from, lte: range.to } },
      include: { items: true, client: true },
    }) as unknown as Promise<LoadedSale[]>;
  }

  private async productNames(): Promise<Map<number, { name: string; price: number }>> {
    const products = await this.prisma.product.findMany();
    return new Map(products.map((p) => [p.id, { name: p.name, price: toNum(p.price) }]));
  }

  private subtotal(sale: LoadedSale): number {
    return sale.items.reduce((a, it) => a + toNum(it.price) * it.quantity, 0);
  }

  private kpi(sales: LoadedSale[]): Kpi {
    let net = 0;
    let gross = 0;
    const cs = new Set<number>();
    for (const s of sales) {
      net += toNum(s.price);
      gross += this.subtotal(s);
      cs.add(s.clientId);
    }
    const count = sales.length;
    return {
      net,
      gross,
      disc: gross - net,
      count,
      clients: cs.size,
      avg: count ? net / count : 0,
    };
  }

  private leaderProduct(
    sales: LoadedSale[],
    names: Map<number, { name: string }>,
  ): string {
    const m = new Map<number, number>();
    for (const s of sales)
      for (const it of s.items) m.set(it.productId, (m.get(it.productId) ?? 0) + it.quantity);
    let best = -1;
    let bid: number | null = null;
    for (const [k, v] of m) if (v > best) [best, bid] = [v, k];
    return bid != null ? (names.get(bid)?.name ?? '—') : '—';
  }

  private async countNewClients(sales: LoadedSale[], from: Date): Promise<number> {
    const ids = [...new Set(sales.map((s) => s.clientId))];
    if (ids.length === 0) return 0;
    const earlier = await this.prisma.purchased.findMany({
      where: { clientId: { in: ids }, purchaseDate: { lt: from } },
      distinct: ['clientId'],
      select: { clientId: true },
    });
    const before = new Set(earlier.map((e) => e.clientId));
    return ids.filter((id) => !before.has(id)).length;
  }

  private buildTimeseries(
    range: DateRange,
    sales: LoadedSale[],
    names: Map<number, { name: string }>,
  ): ChartPoint[] {
    const buckets = buildBuckets(range, this.config.tz);
    return buckets.map((b) => {
      const inb = sales.filter(
        (s) => s.purchaseDate >= b.start && s.purchaseDate <= b.end,
      );
      const k = this.kpi(inb);
      return {
        label: b.label,
        value: k.net,
        tip: {
          title: b.label,
          lines: [
            { k: 'Tushum', v: som(k.net) },
            { k: 'Chegirma', v: som(k.disc) },
            { k: 'Sotuvlar', v: `${k.count} ta` },
            { k: 'Mijozlar', v: `${k.clients} ta` },
            { k: "O'rtacha", v: som(k.avg) },
            { k: 'Yetakchi', v: this.leaderProduct(inb, names) },
          ],
        },
      };
    });
  }

  // ─────────────── endpoints ───────────────

  async dashboard(query: PeriodQuery): Promise<DashboardResponse> {
    const range = this.range(query);
    const [sales, names] = await Promise.all([this.loadSales(range), this.productNames()]);
    const k = this.kpi(sales);
    const newClients = await this.countNewClients(sales, range.from);

    const clientAgg = this.aggregateClients(sales, names);
    const productAgg = this.aggregateProducts(sales, names);

    const miniClients: MiniRankItem[] = clientAgg
      .slice(0, 3)
      .map((c) => ({ id: c.id, name: c.name, value: toMoney(c.sum) }));
    const miniProducts: MiniRankItem[] = productAgg
      .slice(0, 3)
      .map((p) => ({ id: p.id, name: p.name, value: toMoney(p.gross) }));

    return {
      periodLabel: periodLabelFn(query, this.config.tz, this.config.defaultPeriod),
      kpi: {
        revenue: toMoney(k.net),
        discounts: toMoney(k.disc),
        sales: k.count,
        activeClients: k.clients,
        avgCheck: toMoney(k.avg),
        newClients,
      },
      timeseries: this.buildTimeseries(range, sales, names),
      miniClients,
      miniProducts,
    };
  }

  async timeseries(query: PeriodQuery): Promise<TimeseriesResponse> {
    const range = this.range(query);
    const [sales, names] = await Promise.all([this.loadSales(range), this.productNames()]);
    return { points: this.buildTimeseries(range, sales, names) };
  }

  // per-client aggregate over period (+ all-time first/last resolved separately)
  private aggregateClients(
    sales: LoadedSale[],
    names: Map<number, { name: string }>,
  ) {
    const m = new Map<
      number,
      { sum: number; cnt: number; pq: Map<number, number>; name: string; first: string; tel?: string }
    >();
    for (const s of sales) {
      let a = m.get(s.clientId);
      if (!a) {
        a = {
          sum: 0,
          cnt: 0,
          pq: new Map(),
          name: `${s.client.name} ${s.client.surname ?? ''}`.trim(),
          first: s.client.name,
        };
        m.set(s.clientId, a);
      }
      a.sum += toNum(s.price);
      a.cnt += 1;
      for (const it of s.items) a.pq.set(it.productId, (a.pq.get(it.productId) ?? 0) + it.quantity);
    }
    const arr = [...m.entries()].map(([id, a]) => {
      let fav = '—';
      let best = -1;
      for (const [pid, q] of a.pq) if (q > best) [best, fav] = [q, names.get(pid)?.name ?? '—'];
      return {
        id,
        name: a.name,
        firstName: a.first,
        sum: a.sum,
        cnt: a.cnt,
        avg: a.cnt ? a.sum / a.cnt : 0,
        fav,
      };
    });
    arr.sort((x, y) => y.sum - x.sum);
    return arr;
  }

  private aggregateProducts(
    sales: LoadedSale[],
    names: Map<number, { name: string; price: number }>,
  ) {
    const m = new Map<number, { qty: number; gross: number; sales: Set<number> }>();
    let tot = 0;
    for (const s of sales)
      for (const it of s.items) {
        let a = m.get(it.productId);
        if (!a) {
          a = { qty: 0, gross: 0, sales: new Set() };
          m.set(it.productId, a);
        }
        const line = toNum(it.price) * it.quantity;
        a.qty += it.quantity;
        a.gross += line;
        a.sales.add(s.id);
        tot += line;
      }
    const arr = [...m.entries()].map(([id, a]) => ({
      id,
      name: names.get(id)?.name ?? '—',
      qty: a.qty,
      gross: a.gross,
      salesCount: a.sales.size,
      share: tot ? (a.gross / tot) * 100 : 0,
      price: names.get(id)?.price ?? 0,
    }));
    arr.sort((x, y) => y.gross - x.gross);
    return arr;
  }

  async topClients(query: PeriodQuery): Promise<TopClientsResponse> {
    const range = this.range(query);
    const [sales, names] = await Promise.all([this.loadSales(range), this.productNames()]);
    const agg = this.aggregateClients(sales, names);
    const ids = agg.map((a) => a.id);

    // first/last all-time
    const spans = ids.length
      ? await this.prisma.purchased.groupBy({
          by: ['clientId'],
          where: { clientId: { in: ids } },
          _min: { purchaseDate: true },
          _max: { purchaseDate: true },
        })
      : [];
    const spanMap = new Map(spans.map((s) => [s.clientId, s]));
    const tels = await this.prisma.client.findMany({
      where: { id: { in: ids } },
      select: { id: true, telNumber: true },
    });
    const telMap = new Map(tels.map((t) => [t.id, t.telNumber]));

    const items: TopClientItem[] = agg.map((a) => {
      const span = spanMap.get(a.id);
      return {
        id: a.id,
        name: a.name,
        firstName: a.firstName,
        tel: telMap.get(a.id) ?? '',
        sum: toMoney(a.sum),
        count: a.cnt,
        avgCheck: toMoney(a.avg),
        favoriteProduct: a.fav,
        firstDate: span?._min.purchaseDate ? fmtDayLabel(span._min.purchaseDate, this.config.tz) : '—',
        lastDate: span?._max.purchaseDate ? fmtDayLabel(span._max.purchaseDate, this.config.tz) : '—',
      };
    });

    const bars: ChartPoint[] = items.slice(0, 8).map((c) => ({
      label: c.firstName,
      value: toNum(c.sum),
      tip: {
        title: c.name,
        lines: [
          { k: 'Summa', v: som(toNum(c.sum)) },
          { k: 'Xaridlar', v: `${c.count} ta` },
          { k: "O'rt. chek", v: som(toNum(c.avgCheck)) },
          { k: 'Birinchi', v: c.firstDate },
          { k: 'Oxirgi', v: c.lastDate },
          { k: 'Sevimli', v: c.favoriteProduct },
        ],
      },
    }));

    return { bars, items };
  }

  async topProducts(query: PeriodQuery, sort: ProductSort): Promise<TopProductsResponse> {
    const range = this.range(query);
    const [sales, names] = await Promise.all([this.loadSales(range), this.productNames()]);
    const agg = this.aggregateProducts(sales, names);
    if (sort === 'qty') agg.sort((a, b) => b.qty - a.qty);

    const items: TopProductItem[] = agg.map((p) => ({
      id: p.id,
      name: p.name,
      qty: p.qty,
      revenue: toMoney(p.gross),
      salesCount: p.salesCount,
      share: p.share,
      price: toMoney(p.price),
    }));

    const bars: ChartPoint[] = items.slice(0, 8).map((p) => ({
      label: p.name,
      value: sort === 'qty' ? p.qty : toNum(p.revenue),
      tip: {
        title: p.name,
        lines: [
          { k: 'Sotildi', v: `${grp(p.qty)} dona` },
          { k: 'Tushum', v: som(toNum(p.revenue)) },
          { k: 'Sotuvlar', v: `${p.salesCount} ta` },
          { k: 'Ulush', v: `${p.share.toFixed(1)}%` },
          { k: 'Narx', v: som(toNum(p.price)) },
        ],
      },
    }));

    return { bars, items };
  }
}

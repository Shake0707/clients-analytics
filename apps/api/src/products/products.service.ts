import {
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import type { ConfigType } from '@nestjs/config';
import type {
  Paginated,
  PeriodQuery,
  ProductDetail,
  ProductListItem,
  ProductSort,
} from '@nodex/shared';
import { appConfig } from '../config/app.config';
import { fmtDayLabel, resolvePeriod } from '../common/period.util';
import { toMoney, toNum } from '../common/money.util';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProductDto, UpdateProductDto } from './dto/product.dto';

interface ProductStatRow {
  productId: number;
  qty: number | string;
  revenue: number | string;
  sales_count: number | string;
}

@Injectable()
export class ProductsService {
  constructor(
    private readonly prisma: PrismaService,
    @Inject(appConfig.KEY) private readonly config: ConfigType<typeof appConfig>,
  ) {}

  async create(dto: CreateProductDto) {
    const name = dto.name.trim();
    const dup = await this.prisma.product.findFirst({
      where: { name: { equals: name, mode: 'insensitive' } },
    });
    if (dup) throw new ConflictException({ message: 'Bunday mahsulot bor' });
    const product = await this.prisma.product.create({
      data: { name, price: dto.price },
    });
    return { id: product.id };
  }

  async update(id: number, dto: UpdateProductDto) {
    const product = await this.prisma.product.findUnique({ where: { id } });
    if (!product) throw new NotFoundException('Mahsulot topilmadi');

    let name: string | undefined;
    if (dto.name !== undefined) {
      name = dto.name.trim();
      const dup = await this.prisma.product.findFirst({
        where: { name: { equals: name, mode: 'insensitive' }, id: { not: id } },
      });
      if (dup) throw new ConflictException({ message: 'Bunday mahsulot bor' });
    }

    await this.prisma.product.update({
      where: { id },
      data: {
        ...(name !== undefined ? { name } : {}),
        ...(dto.price !== undefined ? { price: dto.price } : {}),
        ...(dto.isActive !== undefined ? { isActive: dto.isActive } : {}),
      },
    });
    return { id };
  }

  /** Удаление товара (§12-E): soft-delete если продавался, иначе жёстко. */
  async remove(id: number) {
    const product = await this.prisma.product.findUnique({ where: { id } });
    if (!product) throw new NotFoundException('Mahsulot topilmadi');

    const soldCount = await this.prisma.purchasedItem.count({ where: { productId: id } });
    if (soldCount > 0) {
      await this.prisma.product.update({ where: { id }, data: { isActive: false } });
      return { id, softDeleted: true };
    }
    await this.prisma.product.delete({ where: { id } });
    return { id, softDeleted: false };
  }

  /** Статистика по товарам за период (gross, §12-O). */
  private async statsByPeriod(from: Date, to: Date): Promise<Map<number, ProductStatRow>> {
    const rows = await this.prisma.$queryRaw<ProductStatRow[]>`
      SELECT pi."productId"                          AS "productId",
             SUM(pi."quantity")                      AS qty,
             SUM(pi."price" * pi."quantity")         AS revenue,
             COUNT(DISTINCT pi."purchasedId")        AS sales_count
      FROM "PurchasedItem" pi
      JOIN "Purchased" pu ON pu.id = pi."purchasedId"
      WHERE pu."purchaseDate" BETWEEN ${from} AND ${to}
      GROUP BY pi."productId";
    `;
    return new Map(rows.map((r) => [Number(r.productId), r]));
  }

  async list(
    query: PeriodQuery,
    search: string | undefined,
    sort: ProductSort,
    limit: number,
    offset: number,
  ): Promise<Paginated<ProductListItem>> {
    const { tz, defaultPeriod } = this.config;
    const { from, to } = resolvePeriod(query, tz, defaultPeriod);

    const s = (search ?? '').trim();
    const where = {
      isActive: true,
      ...(s ? { name: { contains: s, mode: 'insensitive' as const } } : {}),
    };

    const [products, stat] = await Promise.all([
      this.prisma.product.findMany({ where }),
      this.statsByPeriod(from, to),
    ]);

    const items: ProductListItem[] = products.map((p) => {
      const st = stat.get(p.id);
      return {
        id: p.id,
        name: p.name,
        price: toMoney(p.price),
        qty: toNum(st?.qty ?? 0),
        revenue: toMoney(st?.revenue ?? 0),
      };
    });

    items.sort((a, b) =>
      sort === 'qty' ? b.qty - a.qty : toNum(b.revenue) - toNum(a.revenue),
    );
    const total = items.length;
    return { items: items.slice(offset, offset + limit), total, limit, offset };
  }

  async getOne(id: number, query: PeriodQuery): Promise<ProductDetail> {
    const product = await this.prisma.product.findUnique({ where: { id } });
    if (!product) throw new NotFoundException('Mahsulot topilmadi');

    const { tz, defaultPeriod } = this.config;
    const { from, to } = resolvePeriod(query, tz, defaultPeriod);

    const stat = await this.statsByPeriod(from, to);
    const mine = stat.get(id);
    const qty = toNum(mine?.qty ?? 0);
    const revenue = toNum(mine?.revenue ?? 0);
    const salesCount = toNum(mine?.sales_count ?? 0);
    let totalGross = 0;
    for (const r of stat.values()) totalGross += toNum(r.revenue);

    const purchases = await this.prisma.purchased.findMany({
      where: {
        purchaseDate: { gte: from, lte: to },
        items: { some: { productId: id } },
      },
      orderBy: { purchaseDate: 'desc' },
      include: {
        client: true,
        items: { where: { productId: id } },
      },
    });

    const sales = purchases.map((p) => {
      const it = p.items[0];
      const q = it ? it.quantity : 0;
      const line = it ? toNum(it.price) * q : 0;
      return {
        saleId: p.id,
        date: fmtDayLabel(p.purchaseDate, tz),
        clientName: `${p.client.name} ${p.client.surname ?? ''}`.trim(),
        qty: q,
        lineSum: toMoney(line),
      };
    });

    return {
      id: product.id,
      name: product.name,
      price: toMoney(product.price),
      qty,
      revenue: toMoney(revenue),
      salesCount,
      share: totalGross ? (revenue / totalGross) * 100 : 0,
      sales,
    };
  }
}

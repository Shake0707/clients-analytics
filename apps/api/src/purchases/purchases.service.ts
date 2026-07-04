import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import type { ConfigType } from '@nestjs/config';
import type {
  Paginated,
  PeriodQuery,
  SaleDetail,
  SaleListItem,
} from '@nodex/shared';
import { appConfig } from '../config/app.config';
import { fmtDayLabel, resolvePeriod } from '../common/period.util';
import { toMoney, toNum } from '../common/money.util';
import { PrismaService } from '../prisma/prisma.service';
import { CreateSaleDto } from './dto/create-sale.dto';

@Injectable()
export class PurchasesService {
  constructor(
    private readonly prisma: PrismaService,
    @Inject(appConfig.KEY) private readonly config: ConfigType<typeof appConfig>,
  ) {}

  /** Создание продажи транзакцией (§8.2, §12-B/C/D). */
  async create(dto: CreateSaleDto) {
    const productIds = [...new Set(dto.items.map((i) => i.productId))];

    return this.prisma.$transaction(async (tx) => {
      const client = await tx.client.findUnique({ where: { id: dto.clientId } });
      if (!client) throw new NotFoundException('Mijoz topilmadi');

      const products = await tx.product.findMany({
        where: { id: { in: productIds }, isActive: true },
      });
      const priceMap = new Map(products.map((p) => [p.id, p]));

      const lines = dto.items.map((i) => {
        const p = priceMap.get(i.productId);
        if (!p) {
          throw new BadRequestException(
            `Mahsulot topilmadi yoki faol emas (id=${i.productId})`,
          );
        }
        return {
          productId: i.productId,
          quantity: i.quantity,
          price: toNum(p.price), // снимок цены за штуку (§12-D)
        };
      });

      const subtotal = lines.reduce((s, l) => s + l.price * l.quantity, 0);
      if (dto.soldPrice < 0 || dto.soldPrice > subtotal) {
        throw new BadRequestException(
          'Narx [0, hisoblangan summa] oralig‘ida bo‘lishi kerak',
        );
      }

      const purchaseDate = dto.purchaseDate ? new Date(dto.purchaseDate) : new Date();

      const purchase = await tx.purchased.create({
        data: {
          clientId: dto.clientId,
          price: dto.soldPrice,
          purchaseDate,
          items: { create: lines },
        },
      });

      await tx.client.update({
        where: { id: dto.clientId },
        data: { totalAmount: { increment: dto.soldPrice } },
      });

      return { id: purchase.id };
    });
  }

  /** Правка продажи (§8.3): пересчёт + синхронизация totalAmount, в т.ч. смена клиента. */
  async update(id: number, dto: CreateSaleDto) {
    const productIds = [...new Set(dto.items.map((i) => i.productId))];

    return this.prisma.$transaction(async (tx) => {
      const old = await tx.purchased.findUnique({ where: { id } });
      if (!old) throw new NotFoundException('Sotuv topilmadi');

      const client = await tx.client.findUnique({ where: { id: dto.clientId } });
      if (!client) throw new NotFoundException('Mijoz topilmadi');

      const products = await tx.product.findMany({
        where: { id: { in: productIds }, isActive: true },
      });
      const priceMap = new Map(products.map((p) => [p.id, p]));

      const lines = dto.items.map((i) => {
        const p = priceMap.get(i.productId);
        if (!p) {
          throw new BadRequestException(
            `Mahsulot topilmadi yoki faol emas (id=${i.productId})`,
          );
        }
        return { productId: i.productId, quantity: i.quantity, price: toNum(p.price) };
      });

      const subtotal = lines.reduce((s, l) => s + l.price * l.quantity, 0);
      if (dto.soldPrice < 0 || dto.soldPrice > subtotal) {
        throw new BadRequestException(
          'Narx [0, hisoblangan summa] oralig‘ida bo‘lishi kerak',
        );
      }

      const purchaseDate = dto.purchaseDate ? new Date(dto.purchaseDate) : old.purchaseDate;

      // Заменяем позиции.
      await tx.purchasedItem.deleteMany({ where: { purchasedId: id } });
      await tx.purchased.update({
        where: { id },
        data: {
          clientId: dto.clientId,
          purchaseDate,
          price: dto.soldPrice,
          items: { create: lines },
        },
      });

      // Синхронизация Client.totalAmount (§12-B).
      const oldPrice = toNum(old.price);
      if (dto.clientId === old.clientId) {
        await tx.client.update({
          where: { id: old.clientId },
          data: { totalAmount: { increment: dto.soldPrice - oldPrice } },
        });
      } else {
        await tx.client.update({
          where: { id: old.clientId },
          data: { totalAmount: { decrement: oldPrice } },
        });
        await tx.client.update({
          where: { id: dto.clientId },
          data: { totalAmount: { increment: dto.soldPrice } },
        });
      }

      return { id };
    });
  }

  /** Удаление продажи (§8.3): каскад строк + totalAmount −= price. */
  async remove(id: number) {
    return this.prisma.$transaction(async (tx) => {
      const p = await tx.purchased.findUnique({ where: { id } });
      if (!p) throw new NotFoundException('Sotuv topilmadi');

      await tx.purchased.delete({ where: { id } }); // PurchasedItem — onDelete: Cascade
      await tx.client.update({
        where: { id: p.clientId },
        data: { totalAmount: { decrement: toNum(p.price) } },
      });
      return { id };
    });
  }

  async list(
    query: PeriodQuery,
    search: string | undefined,
    limit: number,
    offset: number,
  ): Promise<Paginated<SaleListItem>> {
    const { tz, defaultPeriod } = this.config;
    const { from, to } = resolvePeriod(query, tz, defaultPeriod);
    const s = (search ?? '').trim();

    const where = {
      purchaseDate: { gte: from, lte: to },
      ...(s
        ? {
            client: {
              OR: [
                { name: { contains: s, mode: 'insensitive' as const } },
                { surname: { contains: s, mode: 'insensitive' as const } },
              ],
            },
          }
        : {}),
    };

    const [total, purchases] = await Promise.all([
      this.prisma.purchased.count({ where }),
      this.prisma.purchased.findMany({
        where,
        orderBy: { purchaseDate: 'desc' },
        skip: offset,
        take: limit,
        include: { client: true, items: true },
      }),
    ]);

    const items: SaleListItem[] = purchases.map((p) => {
      const subtotal = p.items.reduce((a, it) => a + toNum(it.price) * it.quantity, 0);
      const sold = toNum(p.price);
      return {
        id: p.id,
        clientName: `${p.client.name} ${p.client.surname ?? ''}`.trim(),
        date: fmtDayLabel(p.purchaseDate, tz),
        positions: p.items.length,
        subtotal: toMoney(subtotal),
        soldPrice: toMoney(sold),
        discount: toMoney(subtotal - sold),
      };
    });

    return { items, total, limit, offset };
  }

  async getOne(id: number): Promise<SaleDetail> {
    const { tz } = this.config;
    const p = await this.prisma.purchased.findUnique({
      where: { id },
      include: { client: true, items: { include: { product: true } } },
    });
    if (!p) throw new NotFoundException('Sotuv topilmadi');

    let subtotal = 0;
    const items = p.items.map((it) => {
      const line = toNum(it.price) * it.quantity;
      subtotal += line;
      return {
        productId: it.productId,
        name: it.product.name,
        quantity: it.quantity,
        price: toMoney(it.price),
        lineSum: toMoney(line),
      };
    });
    const sold = toNum(p.price);

    return {
      id: p.id,
      clientId: p.clientId,
      clientName: `${p.client.name} ${p.client.surname ?? ''}`.trim(),
      clientTel: p.client.telNumber,
      date: fmtDayLabel(p.purchaseDate, tz),
      purchaseDate: p.purchaseDate.toISOString().slice(0, 10),
      items,
      subtotal: toMoney(subtotal),
      soldPrice: toMoney(sold),
      discount: toMoney(subtotal - sold),
    };
  }
}

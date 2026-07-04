import {
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import type { ConfigType } from '@nestjs/config';
import type {
  ClientDetail,
  ClientListItem,
  Paginated,
  PeriodQuery,
} from '@nodex/shared';
import { appConfig } from '../config/app.config';
import { fmtDayLabel, resolvePeriod } from '../common/period.util';
import { normalizePhone } from '../common/phone.util';
import { toMoney, toNum } from '../common/money.util';
import { PrismaService } from '../prisma/prisma.service';
import { CreateClientDto } from './dto/create-client.dto';

@Injectable()
export class ClientsService {
  constructor(
    private readonly prisma: PrismaService,
    @Inject(appConfig.KEY) private readonly config: ConfigType<typeof appConfig>,
  ) {}

  async create(dto: CreateClientDto) {
    const telNumber = normalizePhone(dto.telNumber);
    if (!telNumber) {
      throw new ConflictException({ message: 'Telefon raqami noto‘g‘ri' });
    }
    const existing = await this.prisma.client.findUnique({ where: { telNumber } });
    if (existing) {
      throw new ConflictException({
        message: 'Bu telefon allaqachon mavjud',
        existingClientId: existing.id,
      });
    }
    const client = await this.prisma.client.create({
      data: { name: dto.name.trim(), surname: dto.surname?.trim() || null, telNumber },
    });
    return { id: client.id };
  }

  /** Правка клиента (§4.8). Уникальность телефона — исключая самого себя. */
  async update(id: number, dto: CreateClientDto) {
    const client = await this.prisma.client.findUnique({ where: { id } });
    if (!client) throw new NotFoundException('Mijoz topilmadi');

    const telNumber = normalizePhone(dto.telNumber);
    if (!telNumber) {
      throw new ConflictException({ message: 'Telefon raqami noto‘g‘ri' });
    }
    const dup = await this.prisma.client.findFirst({
      where: { telNumber, id: { not: id } },
    });
    if (dup) {
      throw new ConflictException({
        message: 'Bu telefon allaqachon mavjud',
        existingClientId: dup.id,
      });
    }
    await this.prisma.client.update({
      where: { id },
      data: { name: dto.name.trim(), surname: dto.surname?.trim() || null, telNumber },
    });
    return { id };
  }

  /** Удаление клиента (§12-P): restrict, если есть продажи. */
  async remove(id: number) {
    const client = await this.prisma.client.findUnique({ where: { id } });
    if (!client) throw new NotFoundException('Mijoz topilmadi');

    const salesCount = await this.prisma.purchased.count({ where: { clientId: id } });
    if (salesCount > 0) {
      throw new ConflictException({
        message: 'Bu mijozda sotuvlar mavjud — avval ularni o‘chiring',
        salesCount,
      });
    }
    await this.prisma.client.delete({ where: { id } });
    return { id };
  }

  async list(
    query: PeriodQuery,
    search: string | undefined,
    limit: number,
    offset: number,
  ): Promise<Paginated<ClientListItem>> {
    const { tz, defaultPeriod } = this.config;
    const { from, to } = resolvePeriod(query, tz, defaultPeriod);

    const s = (search ?? '').trim();
    const digits = s.replace(/\D/g, '');
    const where =
      s.length > 0
        ? {
            OR: [
              { name: { contains: s, mode: 'insensitive' as const } },
              { surname: { contains: s, mode: 'insensitive' as const } },
              ...(digits ? [{ telNumber: { contains: digits } }] : []),
            ],
          }
        : {};

    const [clients, agg] = await Promise.all([
      this.prisma.client.findMany({ where }),
      this.prisma.purchased.groupBy({
        by: ['clientId'],
        where: { purchaseDate: { gte: from, lte: to } },
        _sum: { price: true },
        _count: { _all: true },
        _max: { purchaseDate: true },
      }),
    ]);

    const stat = new Map(agg.map((a) => [a.clientId, a]));
    const items: ClientListItem[] = clients.map((c) => {
      const a = stat.get(c.id);
      return {
        id: c.id,
        name: c.name,
        surname: c.surname,
        tel: c.telNumber,
        periodSum: toMoney(a?._sum.price ?? 0),
        periodCount: a?._count._all ?? 0,
        lastDate: a?._max.purchaseDate ? fmtDayLabel(a._max.purchaseDate, tz) : null,
      };
    });

    items.sort((x, y) => toNum(y.periodSum) - toNum(x.periodSum));
    const total = items.length;
    return { items: items.slice(offset, offset + limit), total, limit, offset };
  }

  async getOne(id: number, query: PeriodQuery): Promise<ClientDetail> {
    const client = await this.prisma.client.findUnique({ where: { id } });
    if (!client) throw new NotFoundException('Mijoz topilmadi');

    const { tz, defaultPeriod } = this.config;
    const { from, to } = resolvePeriod(query, tz, defaultPeriod);

    const purchases = await this.prisma.purchased.findMany({
      where: { clientId: id, purchaseDate: { gte: from, lte: to } },
      orderBy: { purchaseDate: 'desc' },
      include: { _count: { select: { items: true } } },
    });

    let periodSum = 0;
    const rows = purchases.map((p) => {
      periodSum += toNum(p.price);
      return {
        id: p.id,
        date: fmtDayLabel(p.purchaseDate, tz),
        positions: p._count.items,
        soldPrice: toMoney(p.price),
      };
    });

    return {
      id: client.id,
      name: client.name,
      surname: client.surname,
      tel: client.telNumber,
      totalAmount: toMoney(client.totalAmount),
      periodSum: toMoney(periodSum),
      periodCount: purchases.length,
      lastDate: rows.length ? rows[0].date : null,
      purchases: rows,
    };
  }
}

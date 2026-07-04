/**
 * Seed — порт `seedDB()` из дизайна (Gigant Tahlil.dc.html).
 * 14 клиентов, 16 товаров, продажи за 116 дней с ~32% скидок.
 * Привязка к реальной «сегодня», чтобы пресеты периодов (today/week/month)
 * содержали данные. Деньги — целые сумы (в рамках Decimal(12,2)).
 */
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../src/generated/prisma/client';

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
});
const prisma = new PrismaClient({ adapter });

// Детерминированный ГПСЧ (splitmix32) — как в дизайне.
function rng(seed: number): () => number {
  let s = seed >>> 0;
  return () => {
    s = (s + 0x9e3779b9) | 0;
    let t = s ^ (s >>> 16);
    t = Math.imul(t, 0x21f0aaad);
    t = t ^ (t >>> 15);
    t = Math.imul(t, 0x735a2d97);
    return ((t ^ (t >>> 15)) >>> 0) / 4294967296;
  };
}

function addDays(d: Date, n: number): Date {
  const x = new Date(d);
  x.setDate(x.getDate() + n);
  return x;
}

async function main() {
  const r = rng(778899);

  // Порядок с учётом FK.
  await prisma.purchasedItem.deleteMany();
  await prisma.purchased.deleteMany();
  await prisma.product.deleteMany();
  await prisma.client.deleteMany();

  const fn = ['Alisher', 'Dilnoza', 'Bekzod', 'Malika', 'Sardor', 'Nigora', 'Jasur', 'Kamola', 'Rustam', 'Shahnoza', 'Oybek', 'Zarina', 'Farrux', 'Gulnora'];
  const ln = ['Karimov', 'Rahimova', 'Toshev', 'Yusupova', 'Ergashev', 'Saidova', 'Nazarov', 'Qodirova', 'Aliyev', 'Usmonova', 'Sobirov', 'Ismoilova', 'Xolmatov', 'Yoqubova'];

  // Клиенты. telNumber нормализован: +998 + 9 цифр, уникальный.
  const clients = [] as { id: number; name: string; surname: string; telNumber: string }[];
  for (let i = 0; i < fn.length; i++) {
    const nine = `9${(10 + (i % 9))}${String(1000000 + Math.floor(r() * 8999999)).slice(0, 7)}`.slice(0, 9);
    const telNumber = `+998${nine}`;
    const c = await prisma.client.create({
      data: { name: fn[i], surname: ln[i], telNumber, totalAmount: 0 },
    });
    clients.push({ id: c.id, name: c.name, surname: c.surname ?? '', telNumber });
  }

  // Товары.
  const pd: [string, number][] = [
    ['Non', 4000], ['Sut', 12000], ['Choy', 22000], ['Shakar', 13000], ['Guruch', 18000],
    ["Yog'", 28000], ['Tuxum', 16000], ['Un', 9000], ['Makaron', 11000], ['Tuz', 3000],
    ['Konserva', 19000], ['Suv', 8000], ['Pechenye', 15000], ['Shokolad', 21000], ['Qahva', 45000], ['Sharbat', 14000],
  ];
  const products = [] as { id: number; price: number }[];
  for (const [name, price] of pd) {
    const p = await prisma.product.create({ data: { name, price, isActive: true } });
    products.push({ id: p.id, price });
  }

  // Продажи за 116 дней (0 = сегодня).
  const now = new Date();
  const totals = new Map<number, number>();
  let salesCount = 0;

  for (let off = 115; off >= 0; off--) {
    const base = off < 7 ? 2.6 : off < 30 ? 2.0 : 1.4;
    let count = Math.floor(r() * base) + (r() < 0.45 ? 1 : 0);
    if (off === 0) count = Math.max(count, 3);

    for (let k = 0; k < count; k++) {
      const cl = clients[Math.floor(r() * clients.length)];
      const nItems = 1 + Math.floor(r() * 4);
      const chosen = new Set<number>();
      const items: { productId: number; quantity: number; price: number }[] = [];
      for (let j = 0; j < nItems; j++) {
        const pr = products[Math.floor(r() * products.length)];
        if (chosen.has(pr.id)) continue;
        chosen.add(pr.id);
        items.push({ productId: pr.id, quantity: 1 + Math.floor(r() * 5), price: pr.price });
      }
      const sub = items.reduce((a, it) => a + it.price * it.quantity, 0);
      let sold = sub;
      if (r() < 0.32) {
        const disc = 0.03 + r() * 0.12;
        sold = Math.round((sub * (1 - disc)) / 1000) * 1000;
        if (sold < 0) sold = 0;
      }
      const d = addDays(now, -off);
      d.setHours(9 + Math.floor(r() * 11), Math.floor(r() * 60), 0, 0);

      await prisma.purchased.create({
        data: {
          clientId: cl.id,
          price: sold,
          purchaseDate: d,
          items: { create: items },
        },
      });
      totals.set(cl.id, (totals.get(cl.id) ?? 0) + sold);
      salesCount++;
    }
  }

  // Синхронизируем Client.totalAmount (§12-B).
  for (const [clientId, total] of totals) {
    await prisma.client.update({ where: { id: clientId }, data: { totalAmount: total } });
  }

  console.log(`Seed done: ${clients.length} clients, ${products.length} products, ${salesCount} sales.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());

/**
 * @nodex/shared — контракты API между `apps/api` (NestJS) и `apps/client` (React).
 *
 * Конвенции:
 * - Деньги (`Money`) передаются строками (Decimal(12,2)) — §5.1 ТЗ, точность.
 *   Форматирование (группировка, "so'm") — на клиенте (i18n).
 * - Числовые метрики для геометрии графиков (`value`, счётчики) — number.
 * - class-validator DTO-классы живут в apps/api и реализуют эти интерфейсы.
 */

export type Money = string;

export type PeriodPreset = 'today' | 'week' | 'month';

/** Период: либо пресет, либо диапазон дат (YYYY-MM-DD, граница дня в SHOP_TIMEZONE). */
export interface PeriodQuery {
  preset?: PeriodPreset;
  from?: string;
  to?: string;
}

export interface Paginated<T> {
  items: T[];
  total: number;
  limit: number;
  offset: number;
}

// ─────────────────────────── Входные DTO ───────────────────────────

export interface CreateClientInput {
  name: string;
  surname?: string;
  /** Любой ввод; на сервере нормализуется до +998XXXXXXXXX. */
  telNumber: string;
}

/** Правка клиента (§4.8): те же поля, что и создание. */
export type UpdateClientInput = CreateClientInput;

export interface CreateProductInput {
  name: string;
  /** Целые сумы, ≥ 0. */
  price: number;
}

export interface UpdateProductInput {
  name?: string;
  price?: number;
  isActive?: boolean;
}

export interface SaleItemInput {
  productId: number;
  quantity: number;
}

export interface CreateSaleInput {
  clientId: number;
  /** ISO-дата продажи; по умолчанию — сейчас. Редактируемая (§12-A). */
  purchaseDate?: string;
  items: SaleItemInput[];
  /** «За сколько продал», 0 ≤ soldPrice ≤ Σ(товары) (§12-C). */
  soldPrice: number;
}

/** Правка продажи (§4.8, §8.3): те же поля, что и создание. */
export type UpdateSaleInput = CreateSaleInput;

// ─────────────────────────── Тултипы графиков (§9) ───────────────────────────

export interface TipLine {
  k: string;
  v: string;
}

export interface Tip {
  title: string;
  lines: TipLine[];
}

/** Точка графика: значение для геометрии + готовый тултип (без дозапроса, §5.2). */
export interface ChartPoint {
  label: string;
  value: number;
  tip: Tip;
}

// ─────────────────────────── Аналитика ───────────────────────────

export interface DashboardKpi {
  revenue: Money; // фактическая (net)
  discounts: Money; // gross − net
  sales: number;
  activeClients: number;
  avgCheck: Money;
  newClients: number;
}

export interface MiniRankItem {
  id: number;
  name: string;
  value: Money;
}

export interface DashboardResponse {
  periodLabel: string;
  kpi: DashboardKpi;
  timeseries: ChartPoint[];
  miniClients: MiniRankItem[];
  miniProducts: MiniRankItem[];
}

export interface TopClientItem {
  id: number;
  name: string;
  firstName: string;
  tel: string;
  sum: Money;
  count: number;
  avgCheck: Money;
  favoriteProduct: string;
  firstDate: string;
  lastDate: string;
}

export interface TopClientsResponse {
  bars: ChartPoint[];
  items: TopClientItem[];
}

export type ProductSort = 'qty' | 'revenue';

export interface TopProductItem {
  id: number;
  name: string;
  qty: number;
  /** Выручка по прайсу (gross). */
  revenue: Money;
  salesCount: number;
  /** Доля в gross-выручке, %. */
  share: number;
  price: Money;
}

export interface TopProductsResponse {
  bars: ChartPoint[];
  items: TopProductItem[];
}

export interface TimeseriesResponse {
  points: ChartPoint[];
}

// ─────────────────────────── Клиенты ───────────────────────────

export interface ClientListItem {
  id: number;
  name: string;
  surname: string | null;
  tel: string;
  /** Сумма за период (0 если покупок нет). */
  periodSum: Money;
  periodCount: number;
  lastDate: string | null;
}

export interface ClientPurchaseRow {
  id: number;
  date: string;
  positions: number;
  soldPrice: Money;
}

export interface ClientDetail {
  id: number;
  name: string;
  surname: string | null;
  tel: string;
  totalAmount: Money; // за всё время
  periodSum: Money;
  periodCount: number;
  lastDate: string | null;
  purchases: ClientPurchaseRow[];
}

// ─────────────────────────── Товары ───────────────────────────

export interface ProductListItem {
  id: number;
  name: string;
  price: Money;
  qty: number; // продано за период
  revenue: Money; // выручка за период (gross)
}

export interface ProductSaleRow {
  saleId: number;
  date: string;
  clientName: string;
  qty: number;
  lineSum: Money;
}

export interface ProductDetail {
  id: number;
  name: string;
  price: Money;
  qty: number;
  revenue: Money;
  salesCount: number;
  share: number;
  sales: ProductSaleRow[];
}

// ─────────────────────────── Продажи ───────────────────────────

export interface SaleListItem {
  id: number;
  clientName: string;
  date: string;
  positions: number;
  subtotal: Money; // расчётная (gross)
  soldPrice: Money; // фактическая (net)
  discount: Money; // subtotal − soldPrice
}

export interface SaleDetailItem {
  productId: number;
  name: string;
  quantity: number;
  price: Money; // снимок цены за штуку
  lineSum: Money;
}

export interface SaleDetail {
  id: number;
  clientId: number;
  clientName: string;
  clientTel: string;
  date: string;
  /** ISO YYYY-MM-DD — для предзаполнения формы правки (§4.8). */
  purchaseDate: string;
  items: SaleDetailItem[];
  subtotal: Money;
  soldPrice: Money;
  discount: Money;
}

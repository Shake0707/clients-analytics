/** Узбекские строки UI (v1 — uz only). Единый словарь под будущий ru. */
export const uz = {
  // nav
  navHome: 'Bosh',
  navClients: 'Mijozlar',
  navPurchases: 'Sotuvlar',
  navProducts: 'Mahsulot',
  brand: 'GIGANT',

  // common
  back: 'Orqaga',
  save: 'Saqlash',
  all: 'Barchasi ›',
  showMore: "Yana ko'rsatish",
  som: "so'm",
  ta: 'ta',
  dona: 'dona',
  pcs: 'pozitsiya',
  change: "O'zgartirish",
  optional: 'Ixtiyoriy',

  // periods & segments
  today: 'Bugun',
  week: 'Hafta',
  month: 'Oy',
  custom: 'Davr',
  segBar: 'Ustun',
  segArea: 'Chiziq',
  sortRevenue: 'Tushum',
  sortQty: 'Dona',

  // home
  homeTitle: 'Bosh sahifa',
  revenueActual: 'Tushum (haqiqiy)',
  discounts: 'Chegirmalar',
  sales: 'Sotuvlar',
  activeClients: 'Faol mijoz',
  avgCheck: "O'rt. chek",
  newClients: 'Yangi mijoz',
  revenueDynamics: 'Tushum dinamikasi',
  chartHint: 'Ustunga bosing — batafsil',
  topClients: 'Top mijozlar',
  topProducts: 'Top mahsulotlar',

  // clients
  clientsTitle: 'Mijozlar',
  clientBtn: 'Mijoz',
  ratingBySum: "Summa bo'yicha reyting",
  searchNameOrPhone: 'Ism yoki telefon...',
  clientNotFound: 'Mijoz topilmadi',
  purchasesPeriod: 'Xaridlar (davr)',
  periodSum: 'Davr summasi',
  purchasesWord: 'Xaridlar',
  allTime: 'Butun davr',
  last: 'Oxirgi',
  noPurchasesPeriod: "Bu davrda xarid yo'q",
  noPurchasesWord: 'xaridsiz',
  purchasesSuffix: 'ta xarid',

  // client new
  clientNewTitle: 'Yangi mijoz',
  fieldName: 'Ism *',
  phName: 'Mijoz ismi',
  fieldSurname: 'Familiya',
  fieldPhone: 'Telefon *',
  phPhone: '+998 90 123 45 67',
  errNameReq: 'Ism majburiy',
  errPhoneReq: 'Telefon majburiy',
  errPhoneDup: 'Bu telefon allaqachon mavjud',

  // purchases
  purchasesTitle: 'Sotuvlar',
  saleBtn: 'Sotuv',
  dynamics: 'Dinamika',
  searchByClient: "Mijoz bo'yicha qidirish...",
  noSalesPeriod: "Bu davrda sotuv yo'q",

  // purchase new
  saleNewTitle: 'Yangi sotuv',
  stepClient: '1 · Mijoz',
  stepDate: '2 · Sotuv sanasi',
  stepProducts: '3 · Mahsulotlar',
  searchPhoneOrName: 'Telefon yoki ism...',
  addNewClient: "+ Yangi mijoz qo'shish",
  searchProduct: 'Mahsulot qidirish...',
  calcSum: 'Hisoblangan summa',
  howMuchSold: 'Qancha sotdingiz',
  discount: 'Chegirma',
  saleHint: "Narx 0 dan hisoblangan summagacha bo'lishi mumkin (ustama taqiqlangan).",
  saveSale: 'Sotuvni saqlash',
  errPickClient: 'Mijozni tanlang',
  errPickProduct: "Kamida bitta mahsulot qo'shing",

  // purchase detail
  saleWord: 'Sotuv',
  composition: 'Tarkibi',
  sold: 'Sotildi',

  // products
  productsTitle: 'Mahsulotlar',
  productBtn: 'Mahsulot',
  productNotFound: 'Mahsulot topilmadi',
  priceWord: 'narx',
  salesPeriod: 'Sotuvlar (davr)',
  soldQty: 'Sotilgan',
  share: 'Ulush',

  // auth gate
  accessDeniedTitle: "Ruxsat yo'q",
  accessDeniedText: "Bu panel faqat do'kon administratori uchun. Iltimos, ilovani Telegram bot orqali oching.",
  retry: 'Qayta urinish',
  loading: 'Yuklanmoqda…',

  // product new
  productNewTitle: 'Yangi mahsulot',
  fieldPName: 'Nomi *',
  phPName: 'Mahsulot nomi',
  fieldPPrice: "Narxi (so'm) *",
  errPNameReq: 'Nomi majburiy',
  errPriceBad: "Narx noto'g'ri",
  errPDup: 'Bunday mahsulot bor',

  // CRUD (§4.8)
  cancel: 'Bekor qilish',
  edit: 'Tahrirlash',
  deleteLabel: "O'chirish",
  saveChanges: "O'zgarishlarni saqlash",
  editClientTitle: 'Mijozni tahrirlash',
  editProductTitle: 'Mahsulotni tahrirlash',
  editSaleTitle: 'Sotuvni tahrirlash',
  understood: 'Tushunarli',
  confirmDelete: "O'chirish",
  cancelChangesTitle: "O'zgarishlarni bekor qilasizmi?",
  cancelChangesMsg: "Kiritilgan ma'lumotlar saqlanmaydi.",
  cancelChangesYes: 'Ha, bekor qilish',
  delClientBlockedTitle: "O'chirib bo'lmaydi",
  delClientBlockedMsg: "Bu mijozda sotuvlar mavjud. Avval uning sotuvlarini o'chiring yoki ko'chiring.",
  delClientTitle: "Mijozni o'chirasizmi?",
  delClientMsgSuffix: "butunlay o'chiriladi.",
  delProductTitle: "Mahsulotni o'chirasizmi?",
  delProductMsg: "ro'yxatdan yashiriladi (sotuvlar tarixi saqlanadi).",
  delSaleTitle: "Sotuvni o'chirasizmi?",
  delSaleMsgSuffix: 'Mijoz jami summasidan ayiriladi.',
} as const;

export type UzKey = keyof typeof uz;
export const t = (key: UzKey): string => uz[key];

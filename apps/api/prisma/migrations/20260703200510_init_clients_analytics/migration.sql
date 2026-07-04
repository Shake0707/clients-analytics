-- CreateTable
CREATE TABLE "Client" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "surname" TEXT,
    "telNumber" TEXT NOT NULL,
    "totalAmount" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Client_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Purchased" (
    "id" SERIAL NOT NULL,
    "clientId" INTEGER NOT NULL,
    "price" DECIMAL(12,2) NOT NULL,
    "purchaseDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Purchased_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Product" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "price" DECIMAL(12,2) NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "Product_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PurchasedItem" (
    "id" SERIAL NOT NULL,
    "purchasedId" INTEGER NOT NULL,
    "productId" INTEGER NOT NULL,
    "quantity" INTEGER NOT NULL,
    "price" DECIMAL(12,2) NOT NULL,

    CONSTRAINT "PurchasedItem_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Client_telNumber_key" ON "Client"("telNumber");

-- CreateIndex
CREATE INDEX "Purchased_clientId_idx" ON "Purchased"("clientId");

-- CreateIndex
CREATE INDEX "Purchased_purchaseDate_idx" ON "Purchased"("purchaseDate");

-- CreateIndex
CREATE UNIQUE INDEX "Product_name_key" ON "Product"("name");

-- CreateIndex
CREATE INDEX "PurchasedItem_purchasedId_idx" ON "PurchasedItem"("purchasedId");

-- CreateIndex
CREATE INDEX "PurchasedItem_productId_idx" ON "PurchasedItem"("productId");

-- AddForeignKey
ALTER TABLE "Purchased" ADD CONSTRAINT "Purchased_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PurchasedItem" ADD CONSTRAINT "PurchasedItem_purchasedId_fkey" FOREIGN KEY ("purchasedId") REFERENCES "Purchased"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PurchasedItem" ADD CONSTRAINT "PurchasedItem_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

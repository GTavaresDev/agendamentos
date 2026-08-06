-- CreateTable Sales
CREATE TABLE "Sales" (
    "id" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "unitPrice" DOUBLE PRECISION NOT NULL,
    "totalPrice" DOUBLE PRECISION NOT NULL,
    "paymentMethod" TEXT NOT NULL DEFAULT 'Dinheiro',
    "createdById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Sales_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Sales_createdAt_idx" ON "Sales"("createdAt");

-- CreateIndex
CREATE INDEX "Sales_productId_idx" ON "Sales"("productId");

-- CreateIndex
CREATE INDEX "Sales_createdById_idx" ON "Sales"("createdById");

-- AddForeignKey
ALTER TABLE "Sales" ADD CONSTRAINT "Sales_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Products"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Sales" ADD CONSTRAINT "Sales_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "Users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

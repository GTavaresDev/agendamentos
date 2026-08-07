-- CreateTable
CREATE TABLE "ClientOAuthAccounts" (
    "id" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "providerAccountId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ClientOAuthAccounts_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ClientOAuthAccounts_provider_providerAccountId_key" ON "ClientOAuthAccounts"("provider", "providerAccountId");

-- CreateIndex
CREATE INDEX "ClientOAuthAccounts_clientId_idx" ON "ClientOAuthAccounts"("clientId");

-- AddForeignKey
ALTER TABLE "ClientOAuthAccounts" ADD CONSTRAINT "ClientOAuthAccounts_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Clients"("id") ON DELETE CASCADE ON UPDATE CASCADE;

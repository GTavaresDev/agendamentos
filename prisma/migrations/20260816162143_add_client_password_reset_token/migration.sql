/*
  Warnings:

  - Made the column `category` on table `SystemPermissions` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Appointments" ALTER COLUMN "service" DROP NOT NULL;

-- AlterTable
ALTER TABLE "SystemPermissions" ALTER COLUMN "category" SET NOT NULL;

-- AlterTable
ALTER TABLE "UserPermissions" ALTER COLUMN "updatedAt" DROP DEFAULT;

-- CreateTable
CREATE TABLE "ClientPasswordResetTokens" (
    "id" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "tokenHash" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "usedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ClientPasswordResetTokens_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ClientPasswordResetTokens_tokenHash_key" ON "ClientPasswordResetTokens"("tokenHash");

-- CreateIndex
CREATE INDEX "ClientPasswordResetTokens_clientId_idx" ON "ClientPasswordResetTokens"("clientId");

-- AddForeignKey
ALTER TABLE "ClientPasswordResetTokens" ADD CONSTRAINT "ClientPasswordResetTokens_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Clients"("id") ON DELETE CASCADE ON UPDATE CASCADE;

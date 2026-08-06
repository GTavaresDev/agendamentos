-- CreateTable
CREATE TABLE "Clients" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "cpf" TEXT,
    "birthDate" TEXT,
    "status" TEXT NOT NULL DEFAULT 'Ativo',
    "initials" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Clients_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Clients_email_key" ON "Clients"("email");

-- AlterTable
ALTER TABLE "Appointments" ADD COLUMN "clientId" TEXT;

-- AddForeignKey
ALTER TABLE "Appointments" ADD CONSTRAINT "Appointments_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Clients"("id") ON DELETE SET NULL ON UPDATE CASCADE;

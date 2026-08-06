-- CreateTable
CREATE TABLE "Services" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "duration" INTEGER NOT NULL,
    "price" DOUBLE PRECISION,
    "status" TEXT NOT NULL DEFAULT 'Ativo',
    "color" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Services_pkey" PRIMARY KEY ("id")
);

-- AlterTable - Add serviceId column to Appointments
ALTER TABLE "Appointments" ADD COLUMN "serviceId" TEXT;

-- AddForeignKey
ALTER TABLE "Appointments" ADD CONSTRAINT "Appointments_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "Services"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AlterTable
ALTER TABLE "Users" ADD COLUMN "password" TEXT;

-- CreateTable
CREATE TABLE "UserPermissions" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "UserPermissions_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "UserPermissions" ADD CONSTRAINT "UserPermissions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "Users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

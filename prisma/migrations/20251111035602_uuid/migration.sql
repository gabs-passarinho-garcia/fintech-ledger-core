/*
  Warnings:

  - The primary key for the `accounts` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `ledger_entries` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The `fromAccountId` column on the `ledger_entries` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `toAccountId` column on the `ledger_entries` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The primary key for the `tenants` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - Changed the type of `id` on the `accounts` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `tenantId` on the `accounts` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `id` on the `ledger_entries` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `tenantId` on the `ledger_entries` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `id` on the `tenants` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- DropForeignKey
ALTER TABLE "public"."accounts" DROP CONSTRAINT "accounts_tenantId_fkey";

-- DropForeignKey
ALTER TABLE "public"."ledger_entries" DROP CONSTRAINT "ledger_entries_fromAccountId_fkey";

-- DropForeignKey
ALTER TABLE "public"."ledger_entries" DROP CONSTRAINT "ledger_entries_tenantId_fkey";

-- DropForeignKey
ALTER TABLE "public"."ledger_entries" DROP CONSTRAINT "ledger_entries_toAccountId_fkey";

-- AlterTable
ALTER TABLE "accounts" DROP CONSTRAINT "accounts_pkey",
DROP COLUMN "id",
ADD COLUMN     "id" UUID NOT NULL,
DROP COLUMN "tenantId",
ADD COLUMN     "tenantId" UUID NOT NULL,
ADD CONSTRAINT "accounts_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "ledger_entries" DROP CONSTRAINT "ledger_entries_pkey",
DROP COLUMN "id",
ADD COLUMN     "id" UUID NOT NULL,
DROP COLUMN "tenantId",
ADD COLUMN     "tenantId" UUID NOT NULL,
DROP COLUMN "fromAccountId",
ADD COLUMN     "fromAccountId" UUID,
DROP COLUMN "toAccountId",
ADD COLUMN     "toAccountId" UUID,
ADD CONSTRAINT "ledger_entries_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "tenants" DROP CONSTRAINT "tenants_pkey",
DROP COLUMN "id",
ADD COLUMN     "id" UUID NOT NULL,
ADD CONSTRAINT "tenants_pkey" PRIMARY KEY ("id");

-- CreateIndex
CREATE INDEX "accounts_tenantId_idx" ON "accounts"("tenantId");

-- CreateIndex
CREATE INDEX "ledger_entries_tenantId_idx" ON "ledger_entries"("tenantId");

-- CreateIndex
CREATE INDEX "ledger_entries_fromAccountId_idx" ON "ledger_entries"("fromAccountId");

-- CreateIndex
CREATE INDEX "ledger_entries_toAccountId_idx" ON "ledger_entries"("toAccountId");

-- AddForeignKey
ALTER TABLE "accounts" ADD CONSTRAINT "accounts_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ledger_entries" ADD CONSTRAINT "ledger_entries_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ledger_entries" ADD CONSTRAINT "ledger_entries_fromAccountId_fkey" FOREIGN KEY ("fromAccountId") REFERENCES "accounts"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ledger_entries" ADD CONSTRAINT "ledger_entries_toAccountId_fkey" FOREIGN KEY ("toAccountId") REFERENCES "accounts"("id") ON DELETE SET NULL ON UPDATE CASCADE;

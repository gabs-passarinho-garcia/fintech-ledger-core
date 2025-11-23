-- AlterTable
ALTER TABLE "accounts" ADD COLUMN     "profileId" UUID;

-- AlterTable
ALTER TABLE "profiles" ADD COLUMN     "balance" DECIMAL(18,2) NOT NULL DEFAULT 0;

-- CreateIndex
CREATE INDEX "accounts_profileId_idx" ON "accounts"("profileId");

-- AddForeignKey
ALTER TABLE "accounts" ADD CONSTRAINT "accounts_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "profiles"("id") ON DELETE SET NULL ON UPDATE CASCADE;

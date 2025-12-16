/*
  Warnings:

  - The `status` column on the `Claim` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateEnum
CREATE TYPE "ClaimStatus" AS ENUM ('PENDING', 'CONFIRMED', 'READY', 'PICKED_UP', 'CANCELLED', 'NO_SHOW');

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "FoodStatus" ADD VALUE 'CONFIRMED';
ALTER TYPE "FoodStatus" ADD VALUE 'READY';
ALTER TYPE "FoodStatus" ADD VALUE 'CANCELLED';

-- AlterTable
ALTER TABLE "Claim" ADD COLUMN     "cancellationReason" TEXT,
ADD COLUMN     "cancelledAt" TIMESTAMP(3),
ADD COLUMN     "cancelledBy" TEXT,
ADD COLUMN     "confirmedAt" TIMESTAMP(3),
ADD COLUMN     "itemStatus" "FoodStatus" NOT NULL DEFAULT 'CLAIMED',
ADD COLUMN     "readyAt" TIMESTAMP(3),
DROP COLUMN "status",
ADD COLUMN     "status" "ClaimStatus" NOT NULL DEFAULT 'PENDING';

-- CreateIndex
CREATE INDEX "Claim_status_idx" ON "Claim"("status");

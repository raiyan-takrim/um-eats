/*
  Warnings:

  - You are about to drop the column `isVerified` on the `Organization` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "OrganizationStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- AlterTable
ALTER TABLE "Organization" DROP COLUMN "isVerified",
ADD COLUMN     "rejectionReason" TEXT,
ADD COLUMN     "status" "OrganizationStatus" NOT NULL DEFAULT 'PENDING',
ADD COLUMN     "verifiedAt" TIMESTAMP(3),
ADD COLUMN     "verifiedBy" TEXT;

-- CreateIndex
CREATE INDEX "Organization_status_idx" ON "Organization"("status");

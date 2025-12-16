-- AlterEnum
ALTER TYPE "OrganizationStatus" ADD VALUE 'BANNED';

-- AlterTable
ALTER TABLE "organization" ADD COLUMN     "bannedAt" TIMESTAMP(3),
ADD COLUMN     "bannedBy" TEXT,
ADD COLUMN     "bannedReason" TEXT;

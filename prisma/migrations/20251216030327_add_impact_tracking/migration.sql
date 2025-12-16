/*
  Warnings:

  - You are about to drop the column `totalFoodSaved` on the `organization` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Claim" ADD COLUMN     "actualImpactPoints" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "estimatedImpactPoints" DOUBLE PRECISION NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "organization" DROP COLUMN "totalFoodSaved",
ADD COLUMN     "totalImpactPoints" DOUBLE PRECISION NOT NULL DEFAULT 0;

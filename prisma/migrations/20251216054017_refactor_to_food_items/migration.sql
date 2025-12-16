/*
  Warnings:

  - A unique constraint covering the columns `[foodItemId]` on the table `Claim` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Claim" ADD COLUMN     "foodItemId" TEXT,
ALTER COLUMN "quantity" SET DEFAULT 1;

-- CreateTable
CREATE TABLE "food_item" (
    "id" TEXT NOT NULL,
    "foodListingId" TEXT NOT NULL,
    "status" "FoodStatus" NOT NULL DEFAULT 'AVAILABLE',
    "itemNumber" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "food_item_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "food_item_foodListingId_idx" ON "food_item"("foodListingId");

-- CreateIndex
CREATE INDEX "food_item_status_idx" ON "food_item"("status");

-- CreateIndex
CREATE UNIQUE INDEX "food_item_foodListingId_itemNumber_key" ON "food_item"("foodListingId", "itemNumber");

-- CreateIndex
CREATE UNIQUE INDEX "Claim_foodItemId_key" ON "Claim"("foodItemId");

-- CreateIndex
CREATE INDEX "Claim_foodItemId_idx" ON "Claim"("foodItemId");

-- AddForeignKey
ALTER TABLE "food_item" ADD CONSTRAINT "food_item_foodListingId_fkey" FOREIGN KEY ("foodListingId") REFERENCES "FoodListing"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Claim" ADD CONSTRAINT "Claim_foodItemId_fkey" FOREIGN KEY ("foodItemId") REFERENCES "food_item"("id") ON DELETE CASCADE ON UPDATE CASCADE;

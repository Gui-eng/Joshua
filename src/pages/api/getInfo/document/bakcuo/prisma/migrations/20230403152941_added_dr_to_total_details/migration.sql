/*
  Warnings:

  - Added the required column `deliveryReciptId` to the `TotalDetails` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `totaldetails` ADD COLUMN `deliveryReciptId` VARCHAR(191) NOT NULL;

-- AddForeignKey
ALTER TABLE `TotalDetails` ADD CONSTRAINT `TotalDetails_deliveryReciptId_fkey` FOREIGN KEY (`deliveryReciptId`) REFERENCES `DeliveryRecipt`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

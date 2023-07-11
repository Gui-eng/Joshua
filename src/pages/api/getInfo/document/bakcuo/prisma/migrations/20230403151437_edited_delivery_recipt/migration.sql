/*
  Warnings:

  - You are about to drop the column `employeeId` on the `deliveryrecipt` table. All the data in the column will be lost.
  - You are about to drop the column `itemSummaryId` on the `deliveryrecipt` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE `deliveryrecipt` DROP FOREIGN KEY `DeliveryRecipt_employeeId_fkey`;

-- DropForeignKey
ALTER TABLE `deliveryrecipt` DROP FOREIGN KEY `DeliveryRecipt_itemSummaryId_fkey`;

-- AlterTable
ALTER TABLE `deliveryrecipt` DROP COLUMN `employeeId`,
    DROP COLUMN `itemSummaryId`,
    ADD COLUMN `pmrEmployeeId` VARCHAR(191) NULL,
    ADD COLUMN `preparedById` VARCHAR(191) NULL,
    ADD COLUMN `salesItemSummaryId` VARCHAR(191) NULL;

-- AddForeignKey
ALTER TABLE `DeliveryRecipt` ADD CONSTRAINT `DeliveryRecipt_pmrEmployeeId_fkey` FOREIGN KEY (`pmrEmployeeId`) REFERENCES `Employee`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `DeliveryRecipt` ADD CONSTRAINT `DeliveryRecipt_preparedById_fkey` FOREIGN KEY (`preparedById`) REFERENCES `Employee`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `DeliveryRecipt` ADD CONSTRAINT `DeliveryRecipt_salesItemSummaryId_fkey` FOREIGN KEY (`salesItemSummaryId`) REFERENCES `ItemSummary`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

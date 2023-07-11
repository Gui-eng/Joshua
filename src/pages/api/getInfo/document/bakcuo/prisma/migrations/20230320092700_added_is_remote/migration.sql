/*
  Warnings:

  - You are about to drop the column `employeeId` on the `salesinvoice` table. All the data in the column will be lost.
  - You are about to drop the column `itemSummaryId` on the `salesinvoice` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE `proofofdelivery` DROP FOREIGN KEY `proofOfDelivery_pmrId_fkey`;

-- DropForeignKey
ALTER TABLE `salesinvoice` DROP FOREIGN KEY `SalesInvoice_employeeId_fkey`;

-- DropForeignKey
ALTER TABLE `salesinvoice` DROP FOREIGN KEY `SalesInvoice_itemSummaryId_fkey`;

-- AlterTable
ALTER TABLE `salesinvoice` DROP COLUMN `employeeId`,
    DROP COLUMN `itemSummaryId`,
    ADD COLUMN `isRemote` BOOLEAN NOT NULL DEFAULT true,
    ADD COLUMN `preparedById` VARCHAR(191) NULL,
    ADD COLUMN `salesItemSummaryId` VARCHAR(191) NULL;

-- AddForeignKey
ALTER TABLE `SalesInvoice` ADD CONSTRAINT `SalesInvoice_preparedById_fkey` FOREIGN KEY (`preparedById`) REFERENCES `Employee`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `SalesInvoice` ADD CONSTRAINT `SalesInvoice_salesItemSummaryId_fkey` FOREIGN KEY (`salesItemSummaryId`) REFERENCES `ItemSummary`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `proofOfDelivery` ADD CONSTRAINT `proofOfDelivery_pmrId_fkey` FOREIGN KEY (`pmrId`) REFERENCES `EmployeeInfo`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

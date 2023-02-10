/*
  Warnings:

  - Added the required column `pmrId` to the `SalesInvoice` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey

-- AlterTable
ALTER TABLE `iteminfo` MODIFY `priceBottle` DECIMAL(65, 30) NOT NULL DEFAULT 0,
    MODIFY `pricePiece` DECIMAL(65, 30) NOT NULL DEFAULT 0,
    MODIFY `priceVial` DECIMAL(65, 30) NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE `salesinvoice` ADD COLUMN `pmrId` VARCHAR(191) NOT NULL;


-- AddForeignKey
ALTER TABLE `SalesInvoice` ADD CONSTRAINT `preparedByEmployeeId` FOREIGN KEY (`employeeId`) REFERENCES `Employee`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

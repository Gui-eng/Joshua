/*
  Warnings:

  - You are about to alter the column `discount` on the `salesinvoice` table. The data in that column could be lost. The data in that column will be cast from `Int` to `Double`.
  - Added the required column `SalesInvoiceId` to the `Employee` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `employee` ADD COLUMN `SalesInvoiceId` VARCHAR(191) NOT NULL;

-- AlterTable
ALTER TABLE `salesinvoice` MODIFY `discount` DOUBLE NOT NULL;

-- AddForeignKey
ALTER TABLE `Employee` ADD CONSTRAINT `Employee_SalesInvoiceId_fkey` FOREIGN KEY (`SalesInvoiceId`) REFERENCES `SalesInvoice`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

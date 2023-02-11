/*
  Warnings:

  - Made the column `salesInvoiceId` on table `client` required. This step will fail if there are existing NULL values in that column.
  - Added the required column `clientId` to the `SalesInvoice` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `client` DROP FOREIGN KEY `Client_salesInvoiceId_fkey`;

-- AlterTable
ALTER TABLE `client` MODIFY `salesInvoiceId` VARCHAR(191) NOT NULL;

-- AlterTable
ALTER TABLE `item` MODIFY `discount` DOUBLE NULL;

-- AlterTable
ALTER TABLE `salesinvoice` ADD COLUMN `clientId` VARCHAR(191) NOT NULL;

-- AddForeignKey
ALTER TABLE `Client` ADD CONSTRAINT `Client_salesInvoiceId_fkey` FOREIGN KEY (`salesInvoiceId`) REFERENCES `SalesInvoice`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `SalesInvoice` ADD CONSTRAINT `SalesInvoice_clientId_fkey` FOREIGN KEY (`clientId`) REFERENCES `Client`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

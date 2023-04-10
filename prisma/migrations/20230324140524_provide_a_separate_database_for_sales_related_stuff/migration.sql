/*
  Warnings:

  - You are about to drop the column `VATableSales` on the `itemsalesdetails` table. All the data in the column will be lost.
  - You are about to drop the column `nonVATSales` on the `itemsalesdetails` table. All the data in the column will be lost.
  - Added the required column `discount` to the `ItemSalesDetails` table without a default value. This is not possible if the table is not empty.
  - Added the required column `grossAmount` to the `ItemSalesDetails` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `itemsalesdetails` DROP COLUMN `VATableSales`,
    DROP COLUMN `nonVATSales`,
    ADD COLUMN `discount` DECIMAL(65, 30) NOT NULL,
    ADD COLUMN `grossAmount` DECIMAL(65, 30) NOT NULL;

-- CreateTable
CREATE TABLE `TotalDetails` (
    `id` VARCHAR(191) NOT NULL,
    `grossAmount` DECIMAL(65, 30) NOT NULL,
    `discount` DECIMAL(65, 30) NOT NULL,
    `netAmount` DECIMAL(65, 30) NOT NULL,
    `VATAmount` DECIMAL(65, 30) NOT NULL,
    `vatable` BOOLEAN NOT NULL,
    `salesInvoiceId` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `TotalDetails_salesInvoiceId_key`(`salesInvoiceId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `TotalDetails` ADD CONSTRAINT `TotalDetails_salesInvoiceId_fkey` FOREIGN KEY (`salesInvoiceId`) REFERENCES `SalesInvoice`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

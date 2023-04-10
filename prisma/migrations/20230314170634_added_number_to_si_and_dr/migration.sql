/*
  Warnings:

  - A unique constraint covering the columns `[deliveryReciptNumber]` on the table `DeliveryRecipt` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[salesInvoiceNumber]` on the table `SalesInvoice` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE `deliveryrecipt` ADD COLUMN `deliveryReciptNumber` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `salesinvoice` ADD COLUMN `salesInvoiceNumber` VARCHAR(191) NULL;

-- CreateIndex
CREATE UNIQUE INDEX `DeliveryRecipt_deliveryReciptNumber_key` ON `DeliveryRecipt`(`deliveryReciptNumber`);

-- CreateIndex
CREATE UNIQUE INDEX `SalesInvoice_salesInvoiceNumber_key` ON `SalesInvoice`(`salesInvoiceNumber`);

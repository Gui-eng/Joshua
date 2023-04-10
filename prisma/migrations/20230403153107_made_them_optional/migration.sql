-- DropForeignKey
ALTER TABLE `totaldetails` DROP FOREIGN KEY `TotalDetails_deliveryReciptId_fkey`;

-- DropForeignKey
ALTER TABLE `totaldetails` DROP FOREIGN KEY `TotalDetails_salesInvoiceId_fkey`;

-- AlterTable
ALTER TABLE `totaldetails` MODIFY `salesInvoiceId` VARCHAR(191) NULL,
    MODIFY `deliveryReciptId` VARCHAR(191) NULL;

-- AddForeignKey
ALTER TABLE `TotalDetails` ADD CONSTRAINT `TotalDetails_salesInvoiceId_fkey` FOREIGN KEY (`salesInvoiceId`) REFERENCES `SalesInvoice`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `TotalDetails` ADD CONSTRAINT `TotalDetails_deliveryReciptId_fkey` FOREIGN KEY (`deliveryReciptId`) REFERENCES `DeliveryRecipt`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

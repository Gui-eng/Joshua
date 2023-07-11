-- DropForeignKey
ALTER TABLE `paymentinfo` DROP FOREIGN KEY `PaymentInfo_salesInvoiceId_fkey`;

-- AlterTable
ALTER TABLE `paymentinfo` ADD COLUMN `deliveryReciptId` VARCHAR(191) NULL,
    MODIFY `salesInvoiceId` VARCHAR(191) NULL;

-- AddForeignKey
ALTER TABLE `PaymentInfo` ADD CONSTRAINT `PaymentInfo_salesInvoiceId_fkey` FOREIGN KEY (`salesInvoiceId`) REFERENCES `SalesInvoice`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PaymentInfo` ADD CONSTRAINT `PaymentInfo_deliveryReciptId_fkey` FOREIGN KEY (`deliveryReciptId`) REFERENCES `DeliveryRecipt`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

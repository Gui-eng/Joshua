-- DropForeignKey
ALTER TABLE `client` DROP FOREIGN KEY `Client_delveryReciptId_fkey`;

-- DropForeignKey
ALTER TABLE `salesinvoice` DROP FOREIGN KEY `SalesInvoice_clientId_fkey`;

-- AlterTable
ALTER TABLE `client` MODIFY `delveryReciptId` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `salesinvoice` MODIFY `clientId` VARCHAR(191) NULL;

-- AddForeignKey
ALTER TABLE `Client` ADD CONSTRAINT `Client_delveryReciptId_fkey` FOREIGN KEY (`delveryReciptId`) REFERENCES `DeliveryRecipt`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `SalesInvoice` ADD CONSTRAINT `SalesInvoice_clientId_fkey` FOREIGN KEY (`clientId`) REFERENCES `Client`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

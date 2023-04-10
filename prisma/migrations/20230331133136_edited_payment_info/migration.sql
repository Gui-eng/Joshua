/*
  Warnings:

  - You are about to drop the `checkinfo` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE `checkinfo` DROP FOREIGN KEY `CheckInfo_clientInfoId_fkey`;

-- DropTable
DROP TABLE `checkinfo`;

-- CreateTable
CREATE TABLE `PaymentInfo` (
    `id` VARCHAR(191) NOT NULL,
    `modeOfPayment` ENUM('CHECK', 'CASH') NOT NULL,
    `checkDate` DATETIME(3) NOT NULL,
    `amount` DECIMAL(65, 30) NOT NULL,
    `depositDateAndTime` DATETIME(3) NOT NULL,
    `clientInfoId` VARCHAR(191) NOT NULL,
    `checkNumber` VARCHAR(191) NOT NULL,
    `salesInvoiceId` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `PaymentInfo` ADD CONSTRAINT `PaymentInfo_clientInfoId_fkey` FOREIGN KEY (`clientInfoId`) REFERENCES `ClientInfo`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PaymentInfo` ADD CONSTRAINT `PaymentInfo_salesInvoiceId_fkey` FOREIGN KEY (`salesInvoiceId`) REFERENCES `SalesInvoice`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

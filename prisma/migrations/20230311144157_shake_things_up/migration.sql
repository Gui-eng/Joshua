/*
  Warnings:

  - The values [PER PIECE] on the enum `PullOutItem_unit` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `stocksBottle` on the `iteminfo` table. All the data in the column will be lost.
  - You are about to drop the column `stocksBox` on the `iteminfo` table. All the data in the column will be lost.
  - You are about to drop the column `stocksPiece` on the `iteminfo` table. All the data in the column will be lost.
  - You are about to drop the column `stocksVial` on the `iteminfo` table. All the data in the column will be lost.
  - You are about to drop the column `amount` on the `soa` table. All the data in the column will be lost.
  - You are about to drop the column `date` on the `soa` table. All the data in the column will be lost.
  - You are about to drop the column `name` on the `soa` table. All the data in the column will be lost.
  - You are about to drop the column `orders` on the `soa` table. All the data in the column will be lost.
  - Added the required column `amountDue` to the `SOA` table without a default value. This is not possible if the table is not empty.
  - Added the required column `clientInfoId` to the `SOA` table without a default value. This is not possible if the table is not empty.
  - Added the required column `lastDateIssued` to the `SOA` table without a default value. This is not possible if the table is not empty.
  - Added the required column `outstandingAmount` to the `SOA` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `clientinfo` ADD COLUMN `pmrId` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `deliveryrecipt` ADD COLUMN `isPaid` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `isPullout` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `proofOfDeliveryId` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `item` ADD COLUMN `isPullout` BOOLEAN NOT NULL DEFAULT false,
    MODIFY `unit` ENUM('BOX', 'VIALS', 'BOTTLES', 'CAPSULES', 'TABLETS') NOT NULL;

-- AlterTable
ALTER TABLE `iteminfo` DROP COLUMN `stocksBottle`,
    DROP COLUMN `stocksBox`,
    DROP COLUMN `stocksPiece`,
    DROP COLUMN `stocksVial`,
    ADD COLUMN `priceCapsule` DECIMAL(65, 30) NOT NULL DEFAULT 0,
    ADD COLUMN `priceTablet` DECIMAL(65, 30) NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE `salesinvoice` ADD COLUMN `isPaid` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `isPullout` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `proofOfDeliveryId` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `soa` DROP COLUMN `amount`,
    DROP COLUMN `date`,
    DROP COLUMN `name`,
    DROP COLUMN `orders`,
    ADD COLUMN `amountDue` DECIMAL(65, 30) NOT NULL,
    ADD COLUMN `clientInfoId` VARCHAR(191) NOT NULL,
    ADD COLUMN `lastDateIssued` DATETIME(3) NOT NULL,
    ADD COLUMN `outstandingAmount` DECIMAL(65, 30) NOT NULL,
    ADD COLUMN `remarks` VARCHAR(191) NULL,
    ADD COLUMN `statementNumber` INTEGER NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE `monthlySales` (
    `id` VARCHAR(191) NOT NULL,
    `dateIssued` DATETIME(3) NOT NULL,
    `salesInvoiceId` VARCHAR(191) NULL,
    `deliveryReciptId` VARCHAR(191) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `CheckInfo` (
    `id` VARCHAR(191) NOT NULL,
    `checkDate` DATETIME(3) NOT NULL,
    `amount` DECIMAL(65, 30) NOT NULL,
    `depositDateAndTime` DATETIME(3) NOT NULL,
    `clientInfoId` VARCHAR(191) NOT NULL,
    `checkNumber` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `PullOutItem` (
    `id` VARCHAR(191) NOT NULL,
    `quantity` INTEGER NOT NULL,
    `unit` ENUM('BOX', 'VIALS', 'BOTTLES', 'CAPSULES', 'TABLETS') NOT NULL,
    `quantityIssued` INTEGER NOT NULL,
    `sIId` VARCHAR(191) NULL,
    `dRId` VARCHAR(191) NULL,
    `itemInfoId` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `PullOut` (
    `id` VARCHAR(191) NOT NULL,
    `pullOutNumber` VARCHAR(191) NOT NULL,
    `dateIssued` DATETIME(3) NOT NULL,
    `requestedById` VARCHAR(191) NOT NULL,
    `clientInfoId` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `MonthlyCollection` (
    `id` VARCHAR(191) NOT NULL,
    `modeOfPayment` ENUM('CHECK', 'CASH') NOT NULL,
    `remarks` VARCHAR(191) NOT NULL,
    `clientInfoId` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `proofOfDelivery` (
    `id` VARCHAR(191) NOT NULL,
    `remarks` VARCHAR(191) NOT NULL,
    `dateRequested` DATETIME(3) NOT NULL,
    `deliveredClientId` VARCHAR(191) NOT NULL,
    `pmrId` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `ClientInfo` ADD CONSTRAINT `ClientInfo_pmrId_fkey` FOREIGN KEY (`pmrId`) REFERENCES `EmployeeInfo`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `SalesInvoice` ADD CONSTRAINT `SalesInvoice_proofOfDeliveryId_fkey` FOREIGN KEY (`proofOfDeliveryId`) REFERENCES `proofOfDelivery`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `DeliveryRecipt` ADD CONSTRAINT `DeliveryRecipt_proofOfDeliveryId_fkey` FOREIGN KEY (`proofOfDeliveryId`) REFERENCES `proofOfDelivery`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `SOA` ADD CONSTRAINT `SOA_clientInfoId_fkey` FOREIGN KEY (`clientInfoId`) REFERENCES `ClientInfo`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `monthlySales` ADD CONSTRAINT `monthlySales_salesInvoiceId_fkey` FOREIGN KEY (`salesInvoiceId`) REFERENCES `SalesInvoice`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `monthlySales` ADD CONSTRAINT `monthlySales_deliveryReciptId_fkey` FOREIGN KEY (`deliveryReciptId`) REFERENCES `DeliveryRecipt`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `CheckInfo` ADD CONSTRAINT `CheckInfo_clientInfoId_fkey` FOREIGN KEY (`clientInfoId`) REFERENCES `ClientInfo`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PullOutItem` ADD CONSTRAINT `PullOutItem_sIId_fkey` FOREIGN KEY (`sIId`) REFERENCES `SalesInvoice`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PullOutItem` ADD CONSTRAINT `PullOutItem_dRId_fkey` FOREIGN KEY (`dRId`) REFERENCES `DeliveryRecipt`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PullOutItem` ADD CONSTRAINT `PullOutItem_itemInfoId_fkey` FOREIGN KEY (`itemInfoId`) REFERENCES `ItemInfo`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PullOut` ADD CONSTRAINT `PullOut_requestedById_fkey` FOREIGN KEY (`requestedById`) REFERENCES `EmployeeInfo`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PullOut` ADD CONSTRAINT `PullOut_clientInfoId_fkey` FOREIGN KEY (`clientInfoId`) REFERENCES `ClientInfo`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `MonthlyCollection` ADD CONSTRAINT `MonthlyCollection_clientInfoId_fkey` FOREIGN KEY (`clientInfoId`) REFERENCES `ClientInfo`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `proofOfDelivery` ADD CONSTRAINT `proofOfDelivery_deliveredClientId_fkey` FOREIGN KEY (`deliveredClientId`) REFERENCES `ClientInfo`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `proofOfDelivery` ADD CONSTRAINT `proofOfDelivery_pmrId_fkey` FOREIGN KEY (`pmrId`) REFERENCES `ClientInfo`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

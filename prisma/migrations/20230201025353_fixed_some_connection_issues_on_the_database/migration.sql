/*
  Warnings:

  - You are about to drop the column `clientId` on the `delveryrecipt` table. All the data in the column will be lost.
  - You are about to drop the column `clientId` on the `salesinvoice` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[salesInvoiceId]` on the table `Client` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[delveryReciptId]` on the table `Client` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `delveryReciptId` to the `Client` table without a default value. This is not possible if the table is not empty.
  - Made the column `itemInfoId` on table `item` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE `delveryrecipt` DROP FOREIGN KEY `DelveryRecipt_clientId_fkey`;

-- DropForeignKey
ALTER TABLE `item` DROP FOREIGN KEY `Item_itemInfoId_fkey`;

-- DropForeignKey
ALTER TABLE `salesinvoice` DROP FOREIGN KEY `SalesInvoice_clientId_fkey`;

-- AlterTable
ALTER TABLE `client` ADD COLUMN `delveryReciptId` VARCHAR(191) NOT NULL,
    ADD COLUMN `salesInvoiceId` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `delveryrecipt` DROP COLUMN `clientId`;

-- AlterTable
ALTER TABLE `item` MODIFY `itemInfoId` VARCHAR(191) NOT NULL;

-- AlterTable
ALTER TABLE `salesinvoice` DROP COLUMN `clientId`;

-- CreateIndex
CREATE UNIQUE INDEX `Client_salesInvoiceId_key` ON `Client`(`salesInvoiceId`);

-- CreateIndex
CREATE UNIQUE INDEX `Client_delveryReciptId_key` ON `Client`(`delveryReciptId`);

-- AddForeignKey
ALTER TABLE `Client` ADD CONSTRAINT `Client_salesInvoiceId_fkey` FOREIGN KEY (`salesInvoiceId`) REFERENCES `SalesInvoice`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Client` ADD CONSTRAINT `Client_delveryReciptId_fkey` FOREIGN KEY (`delveryReciptId`) REFERENCES `DelveryRecipt`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Item` ADD CONSTRAINT `Item_itemInfoId_fkey` FOREIGN KEY (`itemInfoId`) REFERENCES `ItemInfo`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

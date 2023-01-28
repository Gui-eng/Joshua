/*
  Warnings:

  - You are about to drop the column `ExpirationDate` on the `item` table. All the data in the column will be lost.
  - You are about to drop the column `Term` on the `item` table. All the data in the column will be lost.
  - You are about to drop the column `batchNumber` on the `item` table. All the data in the column will be lost.
  - You are about to drop the column `itemName` on the `item` table. All the data in the column will be lost.
  - You are about to drop the column `manufacturingDate` on the `item` table. All the data in the column will be lost.
  - You are about to drop the column `unitPrice` on the `item` table. All the data in the column will be lost.
  - Added the required column `term` to the `Item` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `employee` MODIFY `role` ENUM('ADMIN', 'SALES', 'INVENTORY', 'ACCOUNTING', 'IT') NOT NULL DEFAULT 'ACCOUNTING';

-- AlterTable
ALTER TABLE `item` DROP COLUMN `ExpirationDate`,
    DROP COLUMN `Term`,
    DROP COLUMN `batchNumber`,
    DROP COLUMN `itemName`,
    DROP COLUMN `manufacturingDate`,
    DROP COLUMN `unitPrice`,
    ADD COLUMN `itemInfoId` VARCHAR(191) NULL,
    ADD COLUMN `term` INTEGER NOT NULL;

-- CreateTable
CREATE TABLE `ItemInfo` (
    `id` VARCHAR(191) NOT NULL,
    `itemName` VARCHAR(191) NOT NULL,
    `batchNumber` VARCHAR(191) NOT NULL,
    `manufacturingDate` DATETIME(3) NOT NULL,
    `ExpirationDate` DATETIME(3) NOT NULL,
    `unitPrice` DECIMAL(65, 30) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Item` ADD CONSTRAINT `Item_itemInfoId_fkey` FOREIGN KEY (`itemInfoId`) REFERENCES `ItemInfo`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

/*
  Warnings:

  - You are about to drop the column `priceBottle` on the `iteminfo` table. All the data in the column will be lost.
  - You are about to drop the column `priceBox` on the `iteminfo` table. All the data in the column will be lost.
  - You are about to drop the column `priceCapsule` on the `iteminfo` table. All the data in the column will be lost.
  - You are about to drop the column `priceTablet` on the `iteminfo` table. All the data in the column will be lost.
  - You are about to drop the column `priceVial` on the `iteminfo` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `iteminfo` DROP COLUMN `priceBottle`,
    DROP COLUMN `priceBox`,
    DROP COLUMN `priceCapsule`,
    DROP COLUMN `priceTablet`,
    DROP COLUMN `priceVial`;

-- CreateTable
CREATE TABLE `ItemPrice` (
    `id` VARCHAR(191) NOT NULL,
    `bottle` DECIMAL(65, 30) NOT NULL DEFAULT 0,
    `vial` DECIMAL(65, 30) NOT NULL DEFAULT 0,
    `capsule` DECIMAL(65, 30) NOT NULL DEFAULT 0,
    `tablet` DECIMAL(65, 30) NOT NULL DEFAULT 0,
    `box` DECIMAL(65, 30) NOT NULL DEFAULT 0,
    `itemInfoId` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `ItemPrice` ADD CONSTRAINT `ItemPrice_itemInfoId_fkey` FOREIGN KEY (`itemInfoId`) REFERENCES `ItemInfo`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

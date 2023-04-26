/*
  Warnings:

  - Added the required column `quantity` to the `proofOfDelivery` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `proofofdelivery` ADD COLUMN `quantity` INTEGER NOT NULL;

-- CreateTable
CREATE TABLE `stockRequest` (
    `id` VARCHAR(191) NOT NULL,
    `stockRequestNumber` VARCHAR(191) NOT NULL,
    `quantityRequested` INTEGER NOT NULL,
    `quantityIssued` INTEGER NOT NULL,
    `remarks` VARCHAR(191) NULL,
    `dateRequested` DATETIME(3) NOT NULL,
    `itemInfoId` VARCHAR(191) NOT NULL,
    `requestedById` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `stockRequest` ADD CONSTRAINT `stockRequest_itemInfoId_fkey` FOREIGN KEY (`itemInfoId`) REFERENCES `ItemInfo`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `stockRequest` ADD CONSTRAINT `stockRequest_requestedById_fkey` FOREIGN KEY (`requestedById`) REFERENCES `EmployeeInfo`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

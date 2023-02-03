/*
  Warnings:

  - You are about to drop the column `idNumber` on the `employeeinfo` table. All the data in the column will be lost.
  - You are about to drop the column `middleInitial` on the `employeeinfo` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `employeeinfo` table. All the data in the column will be lost.
  - You are about to drop the column `unitPrice` on the `iteminfo` table. All the data in the column will be lost.
  - You are about to drop the `dr` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `si` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[TIN]` on the table `ClientInfo` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[batchNumber]` on the table `ItemInfo` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[employeeInfoId]` on the table `User` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `address` to the `EmployeeInfo` table without a default value. This is not possible if the table is not empty.
  - Added the required column `contactNo` to the `EmployeeInfo` table without a default value. This is not possible if the table is not empty.
  - Added the required column `dateHired` to the `EmployeeInfo` table without a default value. This is not possible if the table is not empty.
  - Added the required column `department` to the `EmployeeInfo` table without a default value. This is not possible if the table is not empty.
  - Added the required column `middleName` to the `EmployeeInfo` table without a default value. This is not possible if the table is not empty.
  - Added the required column `VAT` to the `ItemInfo` table without a default value. This is not possible if the table is not empty.
  - Added the required column `priceBottle` to the `ItemInfo` table without a default value. This is not possible if the table is not empty.
  - Added the required column `pricePiece` to the `ItemInfo` table without a default value. This is not possible if the table is not empty.
  - Added the required column `priceVial` to the `ItemInfo` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `dr` DROP FOREIGN KEY `DR_clientId_fkey`;

-- DropForeignKey
ALTER TABLE `employeeinfo` DROP FOREIGN KEY `EmployeeInfo_userId_fkey`;

-- DropForeignKey
ALTER TABLE `item` DROP FOREIGN KEY `Item_dRId_fkey`;

-- DropForeignKey
ALTER TABLE `item` DROP FOREIGN KEY `Item_sIId_fkey`;

-- DropForeignKey
ALTER TABLE `si` DROP FOREIGN KEY `SI_clientId_fkey`;

-- DropForeignKey
ALTER TABLE `si` DROP FOREIGN KEY `SI_employeeId_fkey`;

-- AlterTable
ALTER TABLE `employeeinfo` DROP COLUMN `idNumber`,
    DROP COLUMN `middleInitial`,
    DROP COLUMN `userId`,
    ADD COLUMN `address` VARCHAR(191) NOT NULL,
    ADD COLUMN `code` VARCHAR(191) NULL,
    ADD COLUMN `contactNo` VARCHAR(191) NOT NULL,
    ADD COLUMN `dateHired` DATETIME(3) NOT NULL,
    ADD COLUMN `department` ENUM('SALES', 'PMR', 'INVENTORY', 'ACCOUNTING', 'IT') NOT NULL,
    ADD COLUMN `middleName` VARCHAR(191) NOT NULL;

-- AlterTable
ALTER TABLE `iteminfo` DROP COLUMN `unitPrice`,
    ADD COLUMN `VAT` BOOLEAN NOT NULL,
    ADD COLUMN `priceBottle` DECIMAL(65, 30) NOT NULL,
    ADD COLUMN `pricePiece` DECIMAL(65, 30) NOT NULL,
    ADD COLUMN `priceVial` DECIMAL(65, 30) NOT NULL;

-- AlterTable
ALTER TABLE `user` ADD COLUMN `employeeInfoId` VARCHAR(191) NULL,
    ADD COLUMN `isAdmin` BOOLEAN NOT NULL DEFAULT false;

-- DropTable
DROP TABLE `dr`;

-- DropTable
DROP TABLE `si`;

-- CreateTable
CREATE TABLE `SalesInvoice` (
    `id` VARCHAR(191) NOT NULL,
    `currentDate` VARCHAR(191) NOT NULL,
    `totalAmount` DECIMAL(65, 30) NOT NULL,
    `Term` INTEGER NOT NULL,
    `discount` INTEGER NOT NULL,
    `VAT` DECIMAL(65, 30) NOT NULL,
    `employeeId` VARCHAR(191) NOT NULL,
    `clientId` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `DelveryRecipt` (
    `id` VARCHAR(191) NOT NULL,
    `clientId` VARCHAR(191) NOT NULL,
    `totalAmount` DECIMAL(65, 30) NOT NULL,
    `Term` INTEGER NOT NULL,
    `discount` INTEGER NOT NULL,
    `VAT` DECIMAL(65, 30) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE UNIQUE INDEX `ClientInfo_TIN_key` ON `ClientInfo`(`TIN`);

-- CreateIndex
CREATE UNIQUE INDEX `ItemInfo_batchNumber_key` ON `ItemInfo`(`batchNumber`);

-- CreateIndex
CREATE UNIQUE INDEX `User_employeeInfoId_key` ON `User`(`employeeInfoId`);

-- AddForeignKey
ALTER TABLE `User` ADD CONSTRAINT `User_employeeInfoId_fkey` FOREIGN KEY (`employeeInfoId`) REFERENCES `EmployeeInfo`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Item` ADD CONSTRAINT `Item_sIId_fkey` FOREIGN KEY (`sIId`) REFERENCES `SalesInvoice`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Item` ADD CONSTRAINT `Item_dRId_fkey` FOREIGN KEY (`dRId`) REFERENCES `DelveryRecipt`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `SalesInvoice` ADD CONSTRAINT `SalesInvoice_employeeId_fkey` FOREIGN KEY (`employeeId`) REFERENCES `Employee`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `SalesInvoice` ADD CONSTRAINT `SalesInvoice_clientId_fkey` FOREIGN KEY (`clientId`) REFERENCES `Client`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `DelveryRecipt` ADD CONSTRAINT `DelveryRecipt_clientId_fkey` FOREIGN KEY (`clientId`) REFERENCES `Client`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

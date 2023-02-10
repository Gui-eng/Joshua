/*
  Warnings:

  - You are about to drop the column `term` on the `item` table. All the data in the column will be lost.
  - You are about to drop the column `Term` on the `salesinvoice` table. All the data in the column will be lost.
  - You are about to drop the `delveryrecipt` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `discount` to the `Item` table without a default value. This is not possible if the table is not empty.
  - Added the required column `totalAmount` to the `Item` table without a default value. This is not possible if the table is not empty.
  - Added the required column `vatable` to the `Item` table without a default value. This is not possible if the table is not empty.
  - Made the column `quantity` on table `item` required. This step will fail if there are existing NULL values in that column.
  - Made the column `unit` on table `item` required. This step will fail if there are existing NULL values in that column.
  - Added the required column `term` to the `SalesInvoice` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `client` DROP FOREIGN KEY `Client_delveryReciptId_fkey`;

-- DropForeignKey
ALTER TABLE `item` DROP FOREIGN KEY `Item_dRId_fkey`;

-- DropForeignKey
ALTER TABLE `salesinvoice` DROP FOREIGN KEY `SalesInvoice_employeeId_fkey`;

-- AlterTable
ALTER TABLE `item` DROP COLUMN `term`,
    ADD COLUMN `discount` DOUBLE NOT NULL,
    ADD COLUMN `totalAmount` DECIMAL(65, 30) NOT NULL,
    ADD COLUMN `vatable` BOOLEAN NOT NULL,
    MODIFY `quantity` INTEGER NOT NULL,
    MODIFY `unit` ENUM('BOX', 'VIALS', 'BOTTLES', 'PER PIECE') NOT NULL;

-- AlterTable
ALTER TABLE `iteminfo` ADD COLUMN `priceBox` DECIMAL(65, 30) NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE `salesinvoice` DROP COLUMN `Term`,
    ADD COLUMN `term` INTEGER NOT NULL;

-- DropTable
DROP TABLE `delveryrecipt`;

-- CreateTable
CREATE TABLE `DeliveryRecipt` (
    `id` VARCHAR(191) NOT NULL,
    `totalAmount` DECIMAL(65, 30) NOT NULL,
    `Term` INTEGER NOT NULL,
    `discount` INTEGER NOT NULL,
    `VAT` DECIMAL(65, 30) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Client` ADD CONSTRAINT `Client_delveryReciptId_fkey` FOREIGN KEY (`delveryReciptId`) REFERENCES `DeliveryRecipt`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Item` ADD CONSTRAINT `Item_dRId_fkey` FOREIGN KEY (`dRId`) REFERENCES `DeliveryRecipt`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `SalesInvoice` ADD CONSTRAINT `pmrEmployeeId` FOREIGN KEY (`employeeId`) REFERENCES `Employee`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

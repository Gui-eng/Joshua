/*
  Warnings:

  - You are about to drop the column `pmrId` on the `proofofdelivery` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[proofOfDeliveryNumber]` on the table `proofOfDelivery` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `deliveredToId` to the `proofOfDelivery` table without a default value. This is not possible if the table is not empty.
  - Added the required column `itemInfoId` to the `proofOfDelivery` table without a default value. This is not possible if the table is not empty.
  - Added the required column `proofOfDeliveryNumber` to the `proofOfDelivery` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `proofofdelivery` DROP FOREIGN KEY `proofOfDelivery_pmrId_fkey`;

-- AlterTable
ALTER TABLE `proofofdelivery` DROP COLUMN `pmrId`,
    ADD COLUMN `deliveredToId` VARCHAR(191) NOT NULL,
    ADD COLUMN `itemInfoId` VARCHAR(191) NOT NULL,
    ADD COLUMN `proofOfDeliveryNumber` VARCHAR(191) NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX `proofOfDelivery_proofOfDeliveryNumber_key` ON `proofOfDelivery`(`proofOfDeliveryNumber`);

-- AddForeignKey
ALTER TABLE `proofOfDelivery` ADD CONSTRAINT `proofOfDelivery_itemInfoId_fkey` FOREIGN KEY (`itemInfoId`) REFERENCES `ItemInfo`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `proofOfDelivery` ADD CONSTRAINT `proofOfDelivery_deliveredToId_fkey` FOREIGN KEY (`deliveredToId`) REFERENCES `EmployeeInfo`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

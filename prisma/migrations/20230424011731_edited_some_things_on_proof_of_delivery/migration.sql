/*
  Warnings:

  - You are about to drop the column `deliveredToId` on the `proofofdelivery` table. All the data in the column will be lost.
  - Added the required column `pmrId` to the `proofOfDelivery` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `proofofdelivery` DROP FOREIGN KEY `proofOfDelivery_deliveredToId_fkey`;

-- AlterTable
ALTER TABLE `proofofdelivery` DROP COLUMN `deliveredToId`,
    ADD COLUMN `pmrId` VARCHAR(191) NOT NULL,
    MODIFY `remarks` VARCHAR(191) NULL;

-- AddForeignKey
ALTER TABLE `proofOfDelivery` ADD CONSTRAINT `proofOfDelivery_pmrId_fkey` FOREIGN KEY (`pmrId`) REFERENCES `EmployeeInfo`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

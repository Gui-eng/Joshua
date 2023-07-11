/*
  Warnings:

  - A unique constraint covering the columns `[CRARNo]` on the table `PaymentInfo` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE `paymentinfo` ADD COLUMN `remarks` VARCHAR(191) NULL;

-- CreateIndex
CREATE UNIQUE INDEX `PaymentInfo_CRARNo_key` ON `PaymentInfo`(`CRARNo`);

/*
  Warnings:

  - A unique constraint covering the columns `[checkNumber]` on the table `PaymentInfo` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE `paymentinfo` MODIFY `checkNumber` VARCHAR(191) NULL;

-- CreateIndex
CREATE UNIQUE INDEX `PaymentInfo_checkNumber_key` ON `PaymentInfo`(`checkNumber`);

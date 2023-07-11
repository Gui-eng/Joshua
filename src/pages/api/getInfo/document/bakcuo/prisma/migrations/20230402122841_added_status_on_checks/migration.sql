/*
  Warnings:

  - Added the required column `status` to the `PaymentInfo` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `paymentinfo` ADD COLUMN `status` ENUM('SUCCESS', 'FAILED', 'CANCELLED') NOT NULL;

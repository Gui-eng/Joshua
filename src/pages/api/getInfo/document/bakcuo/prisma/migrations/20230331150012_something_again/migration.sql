/*
  Warnings:

  - Added the required column `dateIssued` to the `PaymentInfo` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `paymentinfo` ADD COLUMN `dateIssued` DATETIME(3) NOT NULL;

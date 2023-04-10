/*
  Warnings:

  - You are about to drop the column `Term` on the `deliveryrecipt` table. All the data in the column will be lost.
  - You are about to drop the column `currentDate` on the `deliveryrecipt` table. All the data in the column will be lost.
  - Added the required column `VAT` to the `DeliveryRecipt` table without a default value. This is not possible if the table is not empty.
  - Added the required column `dateIssued` to the `DeliveryRecipt` table without a default value. This is not possible if the table is not empty.
  - Added the required column `term` to the `DeliveryRecipt` table without a default value. This is not possible if the table is not empty.
  - Made the column `deliveryReciptNumber` on table `deliveryrecipt` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE `deliveryrecipt` DROP COLUMN `Term`,
    DROP COLUMN `currentDate`,
    ADD COLUMN `VAT` DECIMAL(65, 30) NOT NULL,
    ADD COLUMN `dateIssued` VARCHAR(191) NOT NULL,
    ADD COLUMN `discount` DOUBLE NULL,
    ADD COLUMN `term` INTEGER NOT NULL,
    MODIFY `deliveryReciptNumber` VARCHAR(191) NOT NULL;

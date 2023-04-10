/*
  Warnings:

  - You are about to drop the column `currentDate` on the `salesinvoice` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[itemInfoId]` on the table `ItemPrice` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `dateIssued` to the `SalesInvoice` table without a default value. This is not possible if the table is not empty.
  - Made the column `salesInvoiceNumber` on table `salesinvoice` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE `salesinvoice` DROP COLUMN `currentDate`,
    ADD COLUMN `dateIssued` VARCHAR(191) NOT NULL,
    MODIFY `salesInvoiceNumber` VARCHAR(191) NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX `ItemPrice_itemInfoId_key` ON `ItemPrice`(`itemInfoId`);

/*
  Warnings:

  - Added the required column `remarks` to the `SalesInvoice` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `salesinvoice` ADD COLUMN `remarks` VARCHAR(500) NOT NULL;

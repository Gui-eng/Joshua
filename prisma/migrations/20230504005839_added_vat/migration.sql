/*
  Warnings:

  - Added the required column `VAT` to the `receivingReportItems` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `receivingreportitems` ADD COLUMN `VAT` BOOLEAN NOT NULL;

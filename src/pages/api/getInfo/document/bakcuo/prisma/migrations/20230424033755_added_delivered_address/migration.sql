/*
  Warnings:

  - Added the required column `deliveredAddress` to the `stockRequest` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `stockrequest` ADD COLUMN `deliveredAddress` VARCHAR(191) NOT NULL;

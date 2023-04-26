/*
  Warnings:

  - Added the required column `unit` to the `proofOfDelivery` table without a default value. This is not possible if the table is not empty.
  - Added the required column `unit` to the `stockRequest` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `proofofdelivery` ADD COLUMN `unit` VARCHAR(191) NOT NULL;

-- AlterTable
ALTER TABLE `stockrequest` ADD COLUMN `unit` VARCHAR(191) NOT NULL;

/*
  Warnings:

  - You are about to drop the column `cwt` on the `paymentinfo` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `paymentinfo` DROP COLUMN `cwt`,
    ADD COLUMN `ewt` DECIMAL(65, 30) NOT NULL DEFAULT 0;

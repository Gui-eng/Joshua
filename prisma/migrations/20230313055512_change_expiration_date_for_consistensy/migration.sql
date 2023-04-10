/*
  Warnings:

  - You are about to drop the column `ExpirationDate` on the `iteminfo` table. All the data in the column will be lost.
  - Added the required column `expirationDate` to the `ItemInfo` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `iteminfo` DROP COLUMN `ExpirationDate`,
    ADD COLUMN `expirationDate` DATETIME(3) NOT NULL;

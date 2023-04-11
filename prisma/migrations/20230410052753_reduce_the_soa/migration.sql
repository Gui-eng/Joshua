/*
  Warnings:

  - You are about to drop the column `amountDue` on the `soa` table. All the data in the column will be lost.
  - You are about to drop the column `lastDateIssued` on the `soa` table. All the data in the column will be lost.
  - You are about to drop the column `outstandingAmount` on the `soa` table. All the data in the column will be lost.
  - You are about to drop the column `remarks` on the `soa` table. All the data in the column will be lost.
  - You are about to drop the column `statementNumber` on the `soa` table. All the data in the column will be lost.
  - Added the required column `dateIssued` to the `SOA` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `soa` DROP COLUMN `amountDue`,
    DROP COLUMN `lastDateIssued`,
    DROP COLUMN `outstandingAmount`,
    DROP COLUMN `remarks`,
    DROP COLUMN `statementNumber`,
    ADD COLUMN `dateIssued` DATETIME(3) NOT NULL;

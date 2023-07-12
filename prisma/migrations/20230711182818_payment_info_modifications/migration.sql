-- DropIndex
DROP INDEX `PaymentInfo_CRARNo_key` ON `paymentinfo`;

-- DropIndex
DROP INDEX `PaymentInfo_checkNumber_key` ON `paymentinfo`;

-- AlterTable
ALTER TABLE `paymentinfo` ADD COLUMN `cwt` DECIMAL(65, 30) NOT NULL DEFAULT 0;

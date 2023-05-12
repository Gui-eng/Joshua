-- DropIndex
DROP INDEX `ItemInfo_batchNumber_key` ON `iteminfo`;

-- AlterTable
ALTER TABLE `iteminfo` ADD COLUMN `isActive` BOOLEAN NOT NULL DEFAULT true;

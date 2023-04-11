/*
  Warnings:

  - You are about to drop the column `requestedById` on the `pullout` table. All the data in the column will be lost.
  - Added the required column `amount` to the `PullOut` table without a default value. This is not possible if the table is not empty.
  - Added the required column `batchNumber` to the `PullOut` table without a default value. This is not possible if the table is not empty.
  - Added the required column `documentNumber` to the `PullOut` table without a default value. This is not possible if the table is not empty.
  - Added the required column `expirationData` to the `PullOut` table without a default value. This is not possible if the table is not empty.
  - Added the required column `itemName` to the `PullOut` table without a default value. This is not possible if the table is not empty.
  - Added the required column `manufacturingDate` to the `PullOut` table without a default value. This is not possible if the table is not empty.
  - Added the required column `quantity` to the `PullOut` table without a default value. This is not possible if the table is not empty.
  - Added the required column `status` to the `PullOut` table without a default value. This is not possible if the table is not empty.
  - Added the required column `totalAmount` to the `PullOut` table without a default value. This is not possible if the table is not empty.
  - Added the required column `unit` to the `PullOut` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `pullout` DROP FOREIGN KEY `PullOut_requestedById_fkey`;

-- AlterTable
ALTER TABLE `pullout` DROP COLUMN `requestedById`,
    ADD COLUMN `amount` DECIMAL(65, 30) NOT NULL,
    ADD COLUMN `batchNumber` VARCHAR(191) NOT NULL,
    ADD COLUMN `documentNumber` VARCHAR(191) NOT NULL,
    ADD COLUMN `expirationData` DATETIME(3) NOT NULL,
    ADD COLUMN `itemName` VARCHAR(191) NOT NULL,
    ADD COLUMN `manufacturingDate` DATETIME(3) NOT NULL,
    ADD COLUMN `quantity` INTEGER NOT NULL,
    ADD COLUMN `status` ENUM('FOR REPLACEMENT', 'EXPIRED', 'NEAR EXPIRY') NOT NULL,
    ADD COLUMN `totalAmount` DECIMAL(65, 30) NOT NULL,
    ADD COLUMN `unit` ENUM('BOX', 'VIALS', 'BOTTLES', 'CAPSULES', 'TABLETS') NOT NULL;

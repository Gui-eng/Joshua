/*
  Warnings:

  - You are about to drop the column `firstName` on the `employee` table. All the data in the column will be lost.
  - You are about to drop the column `idNumber` on the `employee` table. All the data in the column will be lost.
  - You are about to drop the column `lastName` on the `employee` table. All the data in the column will be lost.
  - You are about to drop the column `middleInitial` on the `employee` table. All the data in the column will be lost.
  - You are about to drop the column `employeeId` on the `user` table. All the data in the column will be lost.
  - Added the required column `employeeInfoId` to the `Employee` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `user` DROP FOREIGN KEY `User_employeeId_fkey`;

-- AlterTable
ALTER TABLE `employee` DROP COLUMN `firstName`,
    DROP COLUMN `idNumber`,
    DROP COLUMN `lastName`,
    DROP COLUMN `middleInitial`,
    ADD COLUMN `employeeInfoId` VARCHAR(191) NOT NULL;

-- AlterTable
ALTER TABLE `user` DROP COLUMN `employeeId`;

-- CreateTable
CREATE TABLE `EmployeeInfo` (
    `id` VARCHAR(191) NOT NULL,
    `firstName` VARCHAR(191) NOT NULL,
    `middleInitial` VARCHAR(191) NOT NULL,
    `lastName` VARCHAR(191) NOT NULL,
    `idNumber` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `EmployeeInfo_userId_key`(`userId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `EmployeeInfo` ADD CONSTRAINT `EmployeeInfo_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Employee` ADD CONSTRAINT `Employee_employeeInfoId_fkey` FOREIGN KEY (`employeeInfoId`) REFERENCES `EmployeeInfo`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

/*
  Warnings:

  - You are about to alter the column `status` on the `pullout` table. The data in that column could be lost. The data in that column will be cast from `Enum(EnumId(8))` to `VarChar(191)`.
  - A unique constraint covering the columns `[pullOutNumber]` on the table `PullOut` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE `pullout` MODIFY `status` VARCHAR(191) NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX `PullOut_pullOutNumber_key` ON `PullOut`(`pullOutNumber`);

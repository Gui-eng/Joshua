/*
  Warnings:

  - You are about to drop the column `Bottle` on the `stocks` table. All the data in the column will be lost.
  - You are about to drop the column `Box` on the `stocks` table. All the data in the column will be lost.
  - You are about to drop the column `Capsule` on the `stocks` table. All the data in the column will be lost.
  - You are about to drop the column `Tablet` on the `stocks` table. All the data in the column will be lost.
  - You are about to drop the column `Vial` on the `stocks` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `stocks` DROP COLUMN `Bottle`,
    DROP COLUMN `Box`,
    DROP COLUMN `Capsule`,
    DROP COLUMN `Tablet`,
    DROP COLUMN `Vial`,
    ADD COLUMN `bottle` INTEGER NOT NULL DEFAULT 0,
    ADD COLUMN `box` INTEGER NOT NULL DEFAULT 0,
    ADD COLUMN `capsule` INTEGER NOT NULL DEFAULT 0,
    ADD COLUMN `tablet` INTEGER NOT NULL DEFAULT 0,
    ADD COLUMN `vial` INTEGER NOT NULL DEFAULT 0;

/*
  Warnings:

  - You are about to drop the column `pricePiece` on the `iteminfo` table. All the data in the column will be lost.
  - You are about to drop the column `stocksBottle` on the `stocks` table. All the data in the column will be lost.
  - You are about to drop the column `stocksBox` on the `stocks` table. All the data in the column will be lost.
  - You are about to drop the column `stocksPiece` on the `stocks` table. All the data in the column will be lost.
  - You are about to drop the column `stocksVial` on the `stocks` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `iteminfo` DROP COLUMN `pricePiece`;

-- AlterTable
ALTER TABLE `stocks` DROP COLUMN `stocksBottle`,
    DROP COLUMN `stocksBox`,
    DROP COLUMN `stocksPiece`,
    DROP COLUMN `stocksVial`,
    ADD COLUMN `Bottle` INTEGER NOT NULL DEFAULT 0,
    ADD COLUMN `Box` INTEGER NOT NULL DEFAULT 0,
    ADD COLUMN `Capsule` INTEGER NOT NULL DEFAULT 0,
    ADD COLUMN `Tablet` INTEGER NOT NULL DEFAULT 0,
    ADD COLUMN `Vial` INTEGER NOT NULL DEFAULT 0;

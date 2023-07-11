-- CreateTable
CREATE TABLE `mainStocks` (
    `id` VARCHAR(191) NOT NULL,
    `Vial` INTEGER NOT NULL DEFAULT 0,
    `Bottle` INTEGER NOT NULL DEFAULT 0,
    `Box` INTEGER NOT NULL DEFAULT 0,
    `Capsule` INTEGER NOT NULL DEFAULT 0,
    `Tablet` INTEGER NOT NULL DEFAULT 0,
    `itemInfoId` VARCHAR(191) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `mainStocks` ADD CONSTRAINT `mainStocks_itemInfoId_fkey` FOREIGN KEY (`itemInfoId`) REFERENCES `ItemInfo`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- CreateTable
CREATE TABLE `ChangeStock` (
    `id` VARCHAR(191) NOT NULL,
    `quantity` INTEGER NOT NULL,
    `unit` VARCHAR(191) NOT NULL,
    `remarks` VARCHAR(191) NULL,
    `dateIssued` DATETIME(3) NOT NULL,
    `pmrId` VARCHAR(191) NULL,
    `itemInfoId` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `ChangeStock` ADD CONSTRAINT `ChangeStock_pmrId_fkey` FOREIGN KEY (`pmrId`) REFERENCES `EmployeeInfo`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ChangeStock` ADD CONSTRAINT `ChangeStock_itemInfoId_fkey` FOREIGN KEY (`itemInfoId`) REFERENCES `ItemInfo`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

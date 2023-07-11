-- CreateTable
CREATE TABLE `ItemSalesDetails` (
    `id` VARCHAR(191) NOT NULL,
    `netAmount` DECIMAL(65, 30) NOT NULL,
    `vatExempt` BOOLEAN NOT NULL,
    `VATAmount` DECIMAL(65, 30) NOT NULL,
    `netVATAmount` DECIMAL(65, 30) NOT NULL,
    `VATableSales` DECIMAL(65, 30) NOT NULL,
    `nonVATSales` DECIMAL(65, 30) NOT NULL,
    `itemId` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `ItemSalesDetails` ADD CONSTRAINT `ItemSalesDetails_itemId_fkey` FOREIGN KEY (`itemId`) REFERENCES `Item`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

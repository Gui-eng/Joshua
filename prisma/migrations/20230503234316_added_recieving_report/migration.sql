-- CreateTable
CREATE TABLE `receivingReport` (
    `id` VARCHAR(191) NOT NULL,
    `supplier` VARCHAR(191) NOT NULL,
    `address` VARCHAR(191) NOT NULL,
    `TIN` VARCHAR(191) NOT NULL,
    `remarks` VARCHAR(191) NULL,
    `term` INTEGER NOT NULL,
    `dateIssued` DATETIME(3) NOT NULL,
    `receivingReportNumber` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `receivingReport_TIN_key`(`TIN`),
    UNIQUE INDEX `receivingReport_receivingReportNumber_key`(`receivingReportNumber`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `receivingReportItems` (
    `id` VARCHAR(191) NOT NULL,
    `itemName` VARCHAR(191) NOT NULL,
    `batchNumber` VARCHAR(191) NOT NULL,
    `quantity` INTEGER NOT NULL,
    `unit` VARCHAR(191) NOT NULL,
    `manufacturingDate` DATETIME(3) NOT NULL,
    `expirationDate` DATETIME(3) NOT NULL,
    `receivingReportId` VARCHAR(191) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `receivingReportItems` ADD CONSTRAINT `receivingReportItems_receivingReportId_fkey` FOREIGN KEY (`receivingReportId`) REFERENCES `receivingReport`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

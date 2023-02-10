-- CreateTable
CREATE TABLE `User` (
    `id` VARCHAR(191) NOT NULL,
    `username` VARCHAR(191) NOT NULL,
    `password` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `role` ENUM('ADMIN', 'SALES', 'INVENTORY', 'ACCOUNTING', 'IT') NOT NULL DEFAULT 'ACCOUNTING',
    `isAdmin` BOOLEAN NOT NULL DEFAULT false,
    `employeeInfoId` VARCHAR(191) NULL,

    UNIQUE INDEX `User_username_key`(`username`),
    UNIQUE INDEX `User_email_key`(`email`),
    UNIQUE INDEX `User_employeeInfoId_key`(`employeeInfoId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `EmployeeInfo` (
    `id` VARCHAR(191) NOT NULL,
    `firstName` VARCHAR(191) NOT NULL,
    `middleName` VARCHAR(191) NOT NULL,
    `lastName` VARCHAR(191) NOT NULL,
    `code` VARCHAR(191) NULL,
    `address` VARCHAR(191) NOT NULL,
    `dateHired` DATETIME(3) NOT NULL,
    `department` ENUM('SALES', 'PMR', 'INVENTORY', 'ACCOUNTING', 'IT') NOT NULL,
    `contactNo` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Employee` (
    `id` VARCHAR(191) NOT NULL,
    `employeeInfoId` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ClientInfo` (
    `id` VARCHAR(191) NOT NULL,
    `companyName` VARCHAR(191) NOT NULL,
    `address` VARCHAR(191) NOT NULL,
    `TIN` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `ClientInfo_companyName_key`(`companyName`),
    UNIQUE INDEX `ClientInfo_TIN_key`(`TIN`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Client` (
    `id` VARCHAR(191) NOT NULL,
    `clientInfoId` VARCHAR(191) NOT NULL,
    `salesInvoiceId` VARCHAR(191) NULL,
    `delveryReciptId` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `Client_salesInvoiceId_key`(`salesInvoiceId`),
    UNIQUE INDEX `Client_delveryReciptId_key`(`delveryReciptId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ItemInfo` (
    `id` VARCHAR(191) NOT NULL,
    `itemName` VARCHAR(191) NOT NULL,
    `batchNumber` VARCHAR(191) NOT NULL,
    `manufacturingDate` DATETIME(3) NOT NULL,
    `ExpirationDate` DATETIME(3) NOT NULL,
    `priceBottle` DECIMAL(65, 30) NOT NULL DEFAULT 0,
    `priceVial` DECIMAL(65, 30) NOT NULL DEFAULT 0,
    `pricePiece` DECIMAL(65, 30) NOT NULL DEFAULT 0,
    `priceBox` DECIMAL(65, 30) NOT NULL DEFAULT 0,
    `VAT` BOOLEAN NOT NULL,

    UNIQUE INDEX `ItemInfo_batchNumber_key`(`batchNumber`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Item` (
    `id` VARCHAR(191) NOT NULL,
    `quantity` INTEGER NOT NULL,
    `unit` ENUM('BOX', 'VIALS', 'BOTTLES', 'PER PIECE') NOT NULL,
    `discount` DOUBLE NOT NULL,
    `vatable` BOOLEAN NOT NULL,
    `totalAmount` DECIMAL(65, 30) NOT NULL,
    `sIId` VARCHAR(191) NULL,
    `dRId` VARCHAR(191) NULL,
    `itemInfoId` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `SalesInvoice` (
    `id` VARCHAR(191) NOT NULL,
    `currentDate` VARCHAR(191) NOT NULL,
    `totalAmount` DECIMAL(65, 30) NOT NULL,
    `term` INTEGER NOT NULL,
    `discount` INTEGER NOT NULL,
    `VAT` DECIMAL(65, 30) NOT NULL,
    `pmrEmployeeId` VARCHAR(191) NOT NULL,
    `employeeId` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `DeliveryRecipt` (
    `id` VARCHAR(191) NOT NULL,
    `totalAmount` DECIMAL(65, 30) NOT NULL,
    `Term` INTEGER NOT NULL,
    `discount` INTEGER NOT NULL,
    `VAT` DECIMAL(65, 30) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `WeeklySales` (
    `id` VARCHAR(191) NOT NULL,
    `dateIssued` DATETIME(3) NOT NULL,
    `clientId` VARCHAR(191) NOT NULL,
    `totalOrders` INTEGER NOT NULL,
    `discount` DECIMAL(65, 30) NOT NULL,
    `VAT` DECIMAL(65, 30) NOT NULL,
    `total` DECIMAL(65, 30) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `SOA` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `date` DATETIME(3) NOT NULL,
    `orders` INTEGER NOT NULL,
    `amount` DECIMAL(65, 30) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `User` ADD CONSTRAINT `User_employeeInfoId_fkey` FOREIGN KEY (`employeeInfoId`) REFERENCES `EmployeeInfo`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Employee` ADD CONSTRAINT `Employee_employeeInfoId_fkey` FOREIGN KEY (`employeeInfoId`) REFERENCES `EmployeeInfo`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Client` ADD CONSTRAINT `Client_clientInfoId_fkey` FOREIGN KEY (`clientInfoId`) REFERENCES `ClientInfo`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Client` ADD CONSTRAINT `Client_salesInvoiceId_fkey` FOREIGN KEY (`salesInvoiceId`) REFERENCES `SalesInvoice`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Client` ADD CONSTRAINT `Client_delveryReciptId_fkey` FOREIGN KEY (`delveryReciptId`) REFERENCES `DeliveryRecipt`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Item` ADD CONSTRAINT `Item_sIId_fkey` FOREIGN KEY (`sIId`) REFERENCES `SalesInvoice`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Item` ADD CONSTRAINT `Item_dRId_fkey` FOREIGN KEY (`dRId`) REFERENCES `DeliveryRecipt`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Item` ADD CONSTRAINT `Item_itemInfoId_fkey` FOREIGN KEY (`itemInfoId`) REFERENCES `ItemInfo`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `SalesInvoice` ADD CONSTRAINT `SalesInvoice_pmrEmployeeId_fkey` FOREIGN KEY (`pmrEmployeeId`) REFERENCES `Employee`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `SalesInvoice` ADD CONSTRAINT `SalesInvoice_employeeId_fkey` FOREIGN KEY (`employeeId`) REFERENCES `Employee`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `WeeklySales` ADD CONSTRAINT `WeeklySales_clientId_fkey` FOREIGN KEY (`clientId`) REFERENCES `Client`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

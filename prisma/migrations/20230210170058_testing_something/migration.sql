-- DropForeignKey
ALTER TABLE `employee` DROP FOREIGN KEY `Employee_SalesInvoiceId_fkey`;

-- DropForeignKey
ALTER TABLE `salesinvoice` DROP FOREIGN KEY `SalesInvoice_employeeId_fkey`;

-- DropForeignKey
ALTER TABLE `salesinvoice` DROP FOREIGN KEY `SalesInvoice_pmrEmployeeId_fkey`;

-- AlterTable
ALTER TABLE `employee` MODIFY `SalesInvoiceId` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `salesinvoice` MODIFY `pmrEmployeeId` VARCHAR(191) NULL,
    MODIFY `employeeId` VARCHAR(191) NULL;

-- AddForeignKey
ALTER TABLE `Employee` ADD CONSTRAINT `Employee_SalesInvoiceId_fkey` FOREIGN KEY (`SalesInvoiceId`) REFERENCES `SalesInvoice`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `SalesInvoice` ADD CONSTRAINT `SalesInvoice_pmrEmployeeId_fkey` FOREIGN KEY (`pmrEmployeeId`) REFERENCES `Employee`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `SalesInvoice` ADD CONSTRAINT `SalesInvoice_employeeId_fkey` FOREIGN KEY (`employeeId`) REFERENCES `Employee`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

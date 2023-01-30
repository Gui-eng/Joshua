/*
  Warnings:

  - A unique constraint covering the columns `[companyName]` on the table `ClientInfo` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX `ClientInfo_companyName_key` ON `ClientInfo`(`companyName`);

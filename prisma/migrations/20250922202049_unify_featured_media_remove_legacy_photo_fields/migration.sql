/*
  Warnings:

  - You are about to drop the column `imageUrl` on the `event` table. All the data in the column will be lost.
  - You are about to drop the column `photoUrl` on the `pooja` table. All the data in the column will be lost.
  - You are about to drop the column `photo` on the `priest` table. All the data in the column will be lost.
  - You are about to drop the column `sponsorLogo` on the `sponsorshipbooking` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `event` DROP COLUMN `imageUrl`;

-- AlterTable
ALTER TABLE `pooja` DROP COLUMN `photoUrl`;

-- AlterTable
ALTER TABLE `priest` DROP COLUMN `photo`;

-- AlterTable
ALTER TABLE `sponsorshipbooking` DROP COLUMN `sponsorLogo`,
    ADD COLUMN `logoMediaId` INTEGER NULL;

-- AddForeignKey
ALTER TABLE `sponsorshipbooking` ADD CONSTRAINT `sponsorshipbooking_logoMediaId_fkey` FOREIGN KEY (`logoMediaId`) REFERENCES `mediaasset`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

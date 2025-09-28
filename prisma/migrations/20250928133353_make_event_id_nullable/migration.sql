-- DropForeignKey
ALTER TABLE `eventsponsorship` DROP FOREIGN KEY `eventsponsorship_eventId_fkey`;

-- AlterTable
ALTER TABLE `eventsponsorship` MODIFY `eventId` INTEGER NULL;

-- AddForeignKey
ALTER TABLE `eventsponsorship` ADD CONSTRAINT `eventsponsorship_eventId_fkey` FOREIGN KEY (`eventId`) REFERENCES `event`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

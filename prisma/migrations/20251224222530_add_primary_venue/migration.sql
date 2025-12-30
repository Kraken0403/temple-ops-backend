-- AlterTable
ALTER TABLE `settings` ADD COLUMN `primaryVenueId` INTEGER NULL;

-- AddForeignKey
ALTER TABLE `Settings` ADD CONSTRAINT `Settings_primaryVenueId_fkey` FOREIGN KEY (`primaryVenueId`) REFERENCES `venue`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

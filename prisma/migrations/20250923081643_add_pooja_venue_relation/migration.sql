-- AlterTable
ALTER TABLE `event` ADD COLUMN `isInVenue` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `isOutsideVenue` BOOLEAN NOT NULL DEFAULT true,
    ADD COLUMN `venueId` INTEGER NULL;

-- AddForeignKey
ALTER TABLE `event` ADD CONSTRAINT `event_venueId_fkey` FOREIGN KEY (`venueId`) REFERENCES `venue`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

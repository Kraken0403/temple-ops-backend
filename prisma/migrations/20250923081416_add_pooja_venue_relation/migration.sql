-- AlterTable
ALTER TABLE `pooja` ADD COLUMN `venueId` INTEGER NULL;

-- AddForeignKey
ALTER TABLE `pooja` ADD CONSTRAINT `pooja_venueId_fkey` FOREIGN KEY (`venueId`) REFERENCES `venue`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

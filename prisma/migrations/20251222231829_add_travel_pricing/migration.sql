-- AlterTable
ALTER TABLE `booking` ADD COLUMN `freeTravelKm` DOUBLE NULL,
    ADD COLUMN `travelUnit` VARCHAR(191) NOT NULL DEFAULT 'mile';

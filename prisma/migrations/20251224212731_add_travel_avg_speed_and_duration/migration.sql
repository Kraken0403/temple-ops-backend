-- AlterTable
ALTER TABLE `booking` ADD COLUMN `travelAvgSpeed` DOUBLE NULL,
    ADD COLUMN `travelDurationMin` INTEGER NULL;

-- AlterTable
ALTER TABLE `settings` ADD COLUMN `travelAvgSpeed` DOUBLE NOT NULL DEFAULT 25;

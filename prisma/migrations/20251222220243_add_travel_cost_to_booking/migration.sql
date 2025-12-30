-- AlterTable
ALTER TABLE `booking` ADD COLUMN `travelCost` DOUBLE NULL,
    ADD COLUMN `travelDistanceKm` DOUBLE NULL,
    ADD COLUMN `venueLat` DOUBLE NULL,
    ADD COLUMN `venueLng` DOUBLE NULL;

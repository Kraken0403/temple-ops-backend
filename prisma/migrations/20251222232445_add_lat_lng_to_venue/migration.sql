/*
  Warnings:

  - You are about to drop the column `freeTravelKm` on the `booking` table. All the data in the column will be lost.
  - You are about to drop the column `travelDistanceKm` on the `booking` table. All the data in the column will be lost.
  - You are about to drop the column `travelRatePerKm` on the `booking` table. All the data in the column will be lost.
  - You are about to drop the column `freeTravelKm` on the `settings` table. All the data in the column will be lost.
  - You are about to drop the column `maxServiceKm` on the `settings` table. All the data in the column will be lost.
  - You are about to drop the column `travelRatePerKm` on the `settings` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `booking` DROP COLUMN `freeTravelKm`,
    DROP COLUMN `travelDistanceKm`,
    DROP COLUMN `travelRatePerKm`,
    ADD COLUMN `freeTravelUnits` DOUBLE NULL,
    ADD COLUMN `travelDistance` DOUBLE NULL,
    ADD COLUMN `travelRate` DOUBLE NULL,
    MODIFY `travelUnit` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `settings` DROP COLUMN `freeTravelKm`,
    DROP COLUMN `maxServiceKm`,
    DROP COLUMN `travelRatePerKm`,
    ADD COLUMN `freeTravelUnits` DOUBLE NOT NULL DEFAULT 5,
    ADD COLUMN `maxServiceUnits` DOUBLE NOT NULL DEFAULT 50,
    ADD COLUMN `travelRate` DOUBLE NOT NULL DEFAULT 10,
    ADD COLUMN `travelUnit` VARCHAR(191) NOT NULL DEFAULT 'mile',
    MODIFY `currency` VARCHAR(191) NOT NULL DEFAULT 'USD',
    MODIFY `timezone` VARCHAR(191) NOT NULL DEFAULT 'America/New_York',
    ALTER COLUMN `updatedAt` DROP DEFAULT;

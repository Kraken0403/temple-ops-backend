/*
  Warnings:

  - You are about to drop the column `eventId` on the `eventbooking` table. All the data in the column will be lost.
  - Added the required column `eventDateAtBooking` to the `eventbooking` table without a default value. This is not possible if the table is not empty.
  - Added the required column `eventNameAtBooking` to the `eventbooking` table without a default value. This is not possible if the table is not empty.
  - Added the required column `eventOccurrenceId` to the `eventbooking` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `eventbooking` DROP FOREIGN KEY `eventbooking_eventId_fkey`;

-- DropForeignKey
ALTER TABLE `settings` DROP FOREIGN KEY `Settings_primaryVenueId_fkey`;

-- DropIndex
DROP INDEX `eventbooking_eventId_fkey` ON `eventbooking`;

-- AlterTable
ALTER TABLE `event` ADD COLUMN `recurrenceDays` JSON NULL,
    ADD COLUMN `recurrenceType` ENUM('NONE', 'DAILY', 'WEEKLY', 'MONTHLY', 'YEARLY', 'CUSTOM') NOT NULL DEFAULT 'NONE';

-- AlterTable
ALTER TABLE `eventbooking` DROP COLUMN `eventId`,
    ADD COLUMN `eventDateAtBooking` DATETIME(3) NOT NULL,
    ADD COLUMN `eventNameAtBooking` VARCHAR(191) NOT NULL,
    ADD COLUMN `eventOccurrenceId` INTEGER NOT NULL;

-- CreateTable
CREATE TABLE `eventoccurrence` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `eventId` INTEGER NOT NULL,
    `occurrenceDate` DATETIME(3) NOT NULL,
    `startAt` DATETIME(3) NOT NULL,
    `endAt` DATETIME(3) NOT NULL,
    `capacityOverride` INTEGER NULL,
    `priceOverride` DOUBLE NULL,
    `isCancelled` BOOLEAN NOT NULL DEFAULT false,

    INDEX `eventoccurrence_eventId_idx`(`eventId`),
    INDEX `eventoccurrence_occurrenceDate_idx`(`occurrenceDate`),
    UNIQUE INDEX `eventoccurrence_eventId_occurrenceDate_key`(`eventId`, `occurrenceDate`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE INDEX `eventbooking_eventOccurrenceId_idx` ON `eventbooking`(`eventOccurrenceId`);

-- AddForeignKey
ALTER TABLE `eventbooking` ADD CONSTRAINT `eventbooking_eventOccurrenceId_fkey` FOREIGN KEY (`eventOccurrenceId`) REFERENCES `eventoccurrence`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `eventoccurrence` ADD CONSTRAINT `eventoccurrence_eventId_fkey` FOREIGN KEY (`eventId`) REFERENCES `event`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `settings` ADD CONSTRAINT `settings_primaryVenueId_fkey` FOREIGN KEY (`primaryVenueId`) REFERENCES `venue`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- RenameIndex
ALTER TABLE `eventbooking` RENAME INDEX `eventbooking_userId_fkey` TO `eventbooking_userId_idx`;

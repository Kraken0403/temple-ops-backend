-- AlterTable
ALTER TABLE `eventoccurrence` ADD COLUMN `bookedCount` INTEGER NOT NULL DEFAULT 0,
    ADD COLUMN `capacity` INTEGER NULL;

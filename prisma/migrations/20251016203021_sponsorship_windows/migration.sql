-- AlterTable
ALTER TABLE `eventsponsorship` ADD COLUMN `endsAt` DATETIME(3) NULL,
    ADD COLUMN `isActive` BOOLEAN NOT NULL DEFAULT true,
    ADD COLUMN `startsAt` DATETIME(3) NULL;

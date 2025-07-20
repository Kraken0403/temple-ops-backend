-- AlterTable
ALTER TABLE `pooja` ADD COLUMN `isOutSideVenue` BOOLEAN NOT NULL DEFAULT false,
    MODIFY `isInVenue` BOOLEAN NOT NULL DEFAULT false;

/*
  Warnings:

  - You are about to drop the column `isOutSideVenue` on the `pooja` table. All the data in the column will be lost.
  - Added the required column `isOutsideVenue` to the `Pooja` table without a default value. This is not possible if the table is not empty.
  - Added the required column `languages` to the `Priest` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `pooja` DROP COLUMN `isOutSideVenue`,
    ADD COLUMN `isOutsideVenue` BOOLEAN NOT NULL,
    ALTER COLUMN `isInVenue` DROP DEFAULT;

-- AlterTable
ALTER TABLE `priest` ADD COLUMN `address` VARCHAR(191) NULL,
    ADD COLUMN `contactNo` VARCHAR(191) NULL,
    ADD COLUMN `email` VARCHAR(191) NULL,
    ADD COLUMN `languages` JSON NOT NULL,
    ADD COLUMN `photo` VARCHAR(191) NULL,
    ADD COLUMN `specialty` VARCHAR(191) NULL;

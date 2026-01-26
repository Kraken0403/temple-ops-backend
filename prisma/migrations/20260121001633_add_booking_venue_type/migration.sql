/*
  Warnings:

  - Added the required column `venueType` to the `booking` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `booking` ADD COLUMN `venueType` ENUM('TEMPLE', 'CUSTOM') NOT NULL;

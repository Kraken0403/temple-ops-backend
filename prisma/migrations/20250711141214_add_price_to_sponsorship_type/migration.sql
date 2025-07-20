/*
  Warnings:

  - Added the required column `price` to the `SponsorshipType` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `sponsorshiptype` ADD COLUMN `price` DOUBLE NOT NULL;

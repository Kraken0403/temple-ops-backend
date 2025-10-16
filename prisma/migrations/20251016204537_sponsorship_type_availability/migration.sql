/*
  Warnings:

  - You are about to drop the column `endsAt` on the `eventsponsorship` table. All the data in the column will be lost.
  - You are about to drop the column `isActive` on the `eventsponsorship` table. All the data in the column will be lost.
  - You are about to drop the column `startsAt` on the `eventsponsorship` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `eventsponsorship` DROP COLUMN `endsAt`,
    DROP COLUMN `isActive`,
    DROP COLUMN `startsAt`;

-- AlterTable
ALTER TABLE `sponsorshiptype` ADD COLUMN `defaultMaxSlots` INTEGER NULL,
    ADD COLUMN `endsAt` DATETIME(3) NULL,
    ADD COLUMN `isActive` BOOLEAN NOT NULL DEFAULT true,
    ADD COLUMN `startsAt` DATETIME(3) NULL;

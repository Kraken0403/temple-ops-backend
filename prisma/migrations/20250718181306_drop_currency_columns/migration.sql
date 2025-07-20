/*
  Warnings:

  - You are about to drop the column `currency` on the `donationitem` table. All the data in the column will be lost.
  - You are about to drop the column `currency` on the `event` table. All the data in the column will be lost.
  - You are about to drop the column `currency` on the `pooja` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `donationitem` DROP COLUMN `currency`;

-- AlterTable
ALTER TABLE `event` DROP COLUMN `currency`;

-- AlterTable
ALTER TABLE `pooja` DROP COLUMN `currency`;

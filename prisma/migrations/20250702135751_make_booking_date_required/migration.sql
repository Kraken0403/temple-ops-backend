/*
  Warnings:

  - Made the column `bookingDate` on table `booking` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE `booking` MODIFY `bookingDate` DATETIME(3) NOT NULL;

/*
  Warnings:

  - Made the column `capacity` on table `eventoccurrence` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE `eventoccurrence` MODIFY `capacity` INTEGER NOT NULL;

/*
  Warnings:

  - Added the required column `amountAtBooking` to the `Booking` table without a default value. This is not possible if the table is not empty.
  - Added the required column `poojaNameAtBooking` to the `Booking` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `booking` ADD COLUMN `amountAtBooking` DOUBLE NOT NULL,
    ADD COLUMN `poojaNameAtBooking` VARCHAR(191) NOT NULL,
    ADD COLUMN `priestNameAtBooking` VARCHAR(191) NULL;

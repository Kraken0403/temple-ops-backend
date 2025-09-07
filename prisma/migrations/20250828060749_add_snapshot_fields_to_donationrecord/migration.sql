/*
  Warnings:

  - Added the required column `amountAtDonation` to the `DonationRecord` table without a default value. This is not possible if the table is not empty.
  - Added the required column `itemNameAtDonation` to the `DonationRecord` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `donationrecord` ADD COLUMN `amountAtDonation` DOUBLE NOT NULL,
    ADD COLUMN `itemNameAtDonation` VARCHAR(191) NOT NULL;

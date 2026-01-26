/*
  Warnings:

  - The values [PUJA] on the enum `Payment_purpose` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterTable
ALTER TABLE `payment` MODIFY `purpose` ENUM('EVENT', 'SERVICES', 'DONATION', 'SPONSORSHIP') NOT NULL;

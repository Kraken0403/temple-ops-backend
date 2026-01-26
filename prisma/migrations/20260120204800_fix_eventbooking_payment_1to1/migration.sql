/*
  Warnings:

  - You are about to drop the column `guestEmail` on the `payment` table. All the data in the column will be lost.
  - You are about to drop the column `guestPhone` on the `payment` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `payment` table. All the data in the column will be lost.
  - You are about to alter the column `purpose` on the `payment` table. The data in that column could be lost. The data in that column will be cast from `Enum(EnumId(4))` to `VarChar(191)`.
  - You are about to alter the column `provider` on the `payment` table. The data in that column could be lost. The data in that column will be cast from `Enum(EnumId(6))` to `VarChar(191)`.
  - A unique constraint covering the columns `[paymentId]` on the table `eventbooking` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE `payment` DROP COLUMN `guestEmail`,
    DROP COLUMN `guestPhone`,
    DROP COLUMN `userId`,
    MODIFY `purpose` VARCHAR(191) NOT NULL,
    ALTER COLUMN `currency` DROP DEFAULT,
    MODIFY `provider` VARCHAR(191) NOT NULL DEFAULT 'PAYPAL',
    ALTER COLUMN `status` DROP DEFAULT;

-- CreateIndex
CREATE UNIQUE INDEX `eventbooking_paymentId_key` ON `eventbooking`(`paymentId`);

-- CreateIndex
CREATE INDEX `payment_purpose_referenceId_idx` ON `payment`(`purpose`, `referenceId`);

-- AddForeignKey
ALTER TABLE `eventbooking` ADD CONSTRAINT `eventbooking_paymentId_fkey` FOREIGN KEY (`paymentId`) REFERENCES `payment`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- RenameIndex
ALTER TABLE `newslettersubscriber` RENAME INDEX `NewsletterSubscriber_email_key` TO `newslettersubscriber_email_key`;

-- DropForeignKey
ALTER TABLE `eventbooking` DROP FOREIGN KEY `EventBooking_userId_fkey`;

-- DropIndex
DROP INDEX `EventBooking_userId_fkey` ON `eventbooking`;

-- AlterTable
ALTER TABLE `eventbooking` MODIFY `userId` INTEGER NULL;

-- AddForeignKey
ALTER TABLE `EventBooking` ADD CONSTRAINT `EventBooking_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AlterTable
ALTER TABLE `booking` MODIFY `travelUnit` VARCHAR(191) NOT NULL DEFAULT 'km';

-- CreateIndex
CREATE INDEX `booking_bookingDate_idx` ON `booking`(`bookingDate`);

-- RenameIndex
ALTER TABLE `booking` RENAME INDEX `booking_priestId_fkey` TO `booking_priestId_idx`;

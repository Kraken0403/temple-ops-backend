-- AlterTable
ALTER TABLE `availabilityslot` ADD COLUMN `date` DATETIME(3) NULL,
    MODIFY `start` TIME NOT NULL,
    MODIFY `end` TIME NOT NULL;

-- RenameIndex
ALTER TABLE `availabilityslot` RENAME INDEX `AvailabilitySlot_priestId_fkey` TO `AvailabilitySlot_priestId_idx`;

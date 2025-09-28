-- AlterTable
ALTER TABLE `settings` ADD COLUMN `timezone` VARCHAR(191) NOT NULL DEFAULT 'Asia/Kolkata',
    ADD COLUMN `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3);

-- RenameIndex
ALTER TABLE `category` RENAME INDEX `Category_slug_key` TO `category_slug_key`;

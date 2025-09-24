-- DropForeignKey
ALTER TABLE `bhajan` DROP FOREIGN KEY `Bhajan_categoryId_fkey`;

-- DropForeignKey
ALTER TABLE `blog` DROP FOREIGN KEY `Blog_categoryId_fkey`;

-- AddForeignKey
ALTER TABLE `bhajan` ADD CONSTRAINT `bhajan_categoryId_fkey` FOREIGN KEY (`categoryId`) REFERENCES `Category`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `blog` ADD CONSTRAINT `blog_categoryId_fkey` FOREIGN KEY (`categoryId`) REFERENCES `Category`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- RenameIndex
ALTER TABLE `bhajan` RENAME INDEX `Bhajan_slug_key` TO `bhajan_slug_key`;

-- RenameIndex
ALTER TABLE `blog` RENAME INDEX `Blog_slug_key` TO `blog_slug_key`;

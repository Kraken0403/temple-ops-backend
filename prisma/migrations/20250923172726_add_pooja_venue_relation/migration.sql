/*
  Warnings:

  - You are about to drop the `category` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE `_poojacategories` DROP FOREIGN KEY `_PoojaCategories_A_fkey`;

-- DropForeignKey
ALTER TABLE `_poojacategories` DROP FOREIGN KEY `_PoojaCategories_B_fkey`;

-- DropTable
DROP TABLE `category`;

-- CreateTable
CREATE TABLE `poojacategory` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `slug` VARCHAR(191) NOT NULL,
    `description` VARCHAR(500) NULL,
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `sortOrder` INTEGER NOT NULL DEFAULT 0,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `poojacategory_name_key`(`name`),
    UNIQUE INDEX `poojacategory_slug_key`(`slug`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `_PoojaCategories` ADD CONSTRAINT `_PoojaCategories_A_fkey` FOREIGN KEY (`A`) REFERENCES `pooja`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_PoojaCategories` ADD CONSTRAINT `_PoojaCategories_B_fkey` FOREIGN KEY (`B`) REFERENCES `poojacategory`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

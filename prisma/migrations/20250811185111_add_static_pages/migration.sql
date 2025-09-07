/*
  Warnings:

  - You are about to drop the `page` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE `page`;

-- CreateTable
CREATE TABLE `StaticPage` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `slug` VARCHAR(191) NOT NULL,
    `template` VARCHAR(191) NOT NULL,
    `content` JSON NOT NULL,
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `StaticPage_slug_key`(`slug`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

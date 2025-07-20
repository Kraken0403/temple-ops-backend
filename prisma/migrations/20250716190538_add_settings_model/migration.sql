-- CreateTable
CREATE TABLE `Settings` (
    `id` INTEGER NOT NULL DEFAULT 1,
    `currency` VARCHAR(191) NOT NULL DEFAULT 'INR',

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

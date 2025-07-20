-- CreateTable
CREATE TABLE `DonationItem` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `amount` DOUBLE NOT NULL,
    `currency` VARCHAR(191) NOT NULL DEFAULT 'USD',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `DonationRecord` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `donationItemId` INTEGER NOT NULL,
    `donorName` VARCHAR(191) NOT NULL,
    `donorEmail` VARCHAR(191) NOT NULL,
    `donorPhone` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `DonationRecord` ADD CONSTRAINT `DonationRecord_donationItemId_fkey` FOREIGN KEY (`donationItemId`) REFERENCES `DonationItem`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

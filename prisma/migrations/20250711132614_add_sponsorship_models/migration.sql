-- CreateTable
CREATE TABLE `SponsorshipType` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `description` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `SponsorshipType_name_key`(`name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `EventSponsorship` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `eventId` INTEGER NOT NULL,
    `sponsorshipTypeId` INTEGER NOT NULL,
    `price` DOUBLE NOT NULL,
    `maxSlots` INTEGER NOT NULL DEFAULT 1,

    UNIQUE INDEX `EventSponsorship_eventId_sponsorshipTypeId_key`(`eventId`, `sponsorshipTypeId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `SponsorshipBooking` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `userId` INTEGER NULL,
    `eventSponsorshipId` INTEGER NOT NULL,
    `status` VARCHAR(191) NOT NULL DEFAULT 'pending',
    `sponsorName` VARCHAR(191) NOT NULL,
    `sponsorEmail` VARCHAR(191) NOT NULL,
    `sponsorPhone` VARCHAR(191) NOT NULL,
    `sponsorLogo` VARCHAR(191) NULL,
    `bookedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `EventSponsorship` ADD CONSTRAINT `EventSponsorship_eventId_fkey` FOREIGN KEY (`eventId`) REFERENCES `Event`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `EventSponsorship` ADD CONSTRAINT `EventSponsorship_sponsorshipTypeId_fkey` FOREIGN KEY (`sponsorshipTypeId`) REFERENCES `SponsorshipType`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `SponsorshipBooking` ADD CONSTRAINT `SponsorshipBooking_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `SponsorshipBooking` ADD CONSTRAINT `SponsorshipBooking_eventSponsorshipId_fkey` FOREIGN KEY (`eventSponsorshipId`) REFERENCES `EventSponsorship`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- CreateTable
CREATE TABLE `Priest` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `qualifications` JSON NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Pooja` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `amount` DOUBLE NOT NULL,
    `currency` VARCHAR(191) NOT NULL DEFAULT 'INR',
    `date` DATETIME(3) NOT NULL,
    `time` DATETIME(3) NOT NULL,
    `durationMin` INTEGER NOT NULL,
    `prepTimeMin` INTEGER NOT NULL,
    `bufferMin` INTEGER NOT NULL,
    `isInVenue` BOOLEAN NOT NULL,
    `venueAddress` VARCHAR(191) NULL,
    `mapLink` VARCHAR(191) NULL,
    `allowedZones` JSON NOT NULL,
    `photoUrl` VARCHAR(191) NULL,
    `includeFood` BOOLEAN NOT NULL DEFAULT false,
    `includeHall` BOOLEAN NOT NULL DEFAULT false,
    `materials` VARCHAR(191) NULL,
    `notes` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `AvailabilitySlot` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `priestId` INTEGER NOT NULL,
    `start` DATETIME(3) NOT NULL,
    `end` DATETIME(3) NOT NULL,
    `disabled` BOOLEAN NOT NULL DEFAULT false,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Booking` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `userId` INTEGER NOT NULL,
    `poojaId` INTEGER NOT NULL,
    `priestId` INTEGER NOT NULL,
    `start` DATETIME(3) NOT NULL,
    `end` DATETIME(3) NOT NULL,
    `status` VARCHAR(191) NOT NULL DEFAULT 'confirmed',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `_PoojaPriests` (
    `A` INTEGER NOT NULL,
    `B` INTEGER NOT NULL,

    UNIQUE INDEX `_PoojaPriests_AB_unique`(`A`, `B`),
    INDEX `_PoojaPriests_B_index`(`B`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `AvailabilitySlot` ADD CONSTRAINT `AvailabilitySlot_priestId_fkey` FOREIGN KEY (`priestId`) REFERENCES `Priest`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Booking` ADD CONSTRAINT `Booking_poojaId_fkey` FOREIGN KEY (`poojaId`) REFERENCES `Pooja`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Booking` ADD CONSTRAINT `Booking_priestId_fkey` FOREIGN KEY (`priestId`) REFERENCES `Priest`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_PoojaPriests` ADD CONSTRAINT `_PoojaPriests_A_fkey` FOREIGN KEY (`A`) REFERENCES `Pooja`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_PoojaPriests` ADD CONSTRAINT `_PoojaPriests_B_fkey` FOREIGN KEY (`B`) REFERENCES `Priest`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

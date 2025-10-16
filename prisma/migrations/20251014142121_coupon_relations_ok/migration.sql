-- AlterTable
ALTER TABLE `booking` ADD COLUMN `couponCode` VARCHAR(64) NULL,
    ADD COLUMN `discountAmount` DOUBLE NULL DEFAULT 0,
    ADD COLUMN `total` DOUBLE NULL;

-- AlterTable
ALTER TABLE `eventbooking` ADD COLUMN `couponCode` VARCHAR(64) NULL,
    ADD COLUMN `discountAmount` DOUBLE NULL DEFAULT 0,
    ADD COLUMN `subtotal` DOUBLE NULL,
    ADD COLUMN `total` DOUBLE NULL;

-- CreateTable
CREATE TABLE `coupon` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `code` VARCHAR(191) NOT NULL,
    `description` VARCHAR(500) NULL,
    `type` ENUM('PERCENT', 'FIXED') NOT NULL,
    `value` DOUBLE NOT NULL,
    `maxDiscount` DOUBLE NULL,
    `minOrderAmount` DOUBLE NULL,
    `startsAt` DATETIME(3) NULL,
    `endsAt` DATETIME(3) NULL,
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `stackable` BOOLEAN NOT NULL DEFAULT false,
    `usageLimit` INTEGER NULL,
    `usageLimitPerUser` INTEGER NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `coupon_code_key`(`code`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `couponevent` (
    `couponId` INTEGER NOT NULL,
    `eventId` INTEGER NOT NULL,

    INDEX `couponevent_eventId_idx`(`eventId`),
    PRIMARY KEY (`couponId`, `eventId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `couponpooja` (
    `couponId` INTEGER NOT NULL,
    `poojaId` INTEGER NOT NULL,

    INDEX `couponpooja_poojaId_idx`(`poojaId`),
    PRIMARY KEY (`couponId`, `poojaId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `couponpoojacategory` (
    `couponId` INTEGER NOT NULL,
    `poojaCategoryId` INTEGER NOT NULL,

    INDEX `couponpoojacategory_poojaCategoryId_idx`(`poojaCategoryId`),
    PRIMARY KEY (`couponId`, `poojaCategoryId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `couponredemption` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `couponId` INTEGER NOT NULL,
    `userId` INTEGER NULL,
    `targetType` ENUM('EVENT_BOOKING', 'POOJA_BOOKING') NOT NULL,
    `eventBookingId` INTEGER NULL,
    `poojaBookingId` INTEGER NULL,
    `amountApplied` DOUBLE NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `couponredemption_userId_idx`(`userId`),
    UNIQUE INDEX `couponredemption_couponId_eventBookingId_key`(`couponId`, `eventBookingId`),
    UNIQUE INDEX `couponredemption_couponId_poojaBookingId_key`(`couponId`, `poojaBookingId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `couponevent` ADD CONSTRAINT `couponevent_couponId_fkey` FOREIGN KEY (`couponId`) REFERENCES `coupon`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `couponevent` ADD CONSTRAINT `couponevent_eventId_fkey` FOREIGN KEY (`eventId`) REFERENCES `event`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `couponpooja` ADD CONSTRAINT `couponpooja_couponId_fkey` FOREIGN KEY (`couponId`) REFERENCES `coupon`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `couponpooja` ADD CONSTRAINT `couponpooja_poojaId_fkey` FOREIGN KEY (`poojaId`) REFERENCES `pooja`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `couponpoojacategory` ADD CONSTRAINT `couponpoojacategory_couponId_fkey` FOREIGN KEY (`couponId`) REFERENCES `coupon`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `couponpoojacategory` ADD CONSTRAINT `couponpoojacategory_poojaCategoryId_fkey` FOREIGN KEY (`poojaCategoryId`) REFERENCES `poojacategory`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `couponredemption` ADD CONSTRAINT `couponredemption_couponId_fkey` FOREIGN KEY (`couponId`) REFERENCES `coupon`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `couponredemption` ADD CONSTRAINT `couponredemption_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `user`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `couponredemption` ADD CONSTRAINT `couponredemption_eventBookingId_fkey` FOREIGN KEY (`eventBookingId`) REFERENCES `eventbooking`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `couponredemption` ADD CONSTRAINT `couponredemption_poojaBookingId_fkey` FOREIGN KEY (`poojaBookingId`) REFERENCES `booking`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

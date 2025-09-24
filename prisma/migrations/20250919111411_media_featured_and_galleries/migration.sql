-- DropForeignKey
ALTER TABLE `album` DROP FOREIGN KEY `Album_coverId_fkey`;

-- DropForeignKey
ALTER TABLE `albumitem` DROP FOREIGN KEY `AlbumItem_albumId_fkey`;

-- DropForeignKey
ALTER TABLE `albumitem` DROP FOREIGN KEY `AlbumItem_mediaId_fkey`;

-- DropForeignKey
ALTER TABLE `availabilityslot` DROP FOREIGN KEY `AvailabilitySlot_priestId_fkey`;

-- DropForeignKey
ALTER TABLE `booking` DROP FOREIGN KEY `Booking_poojaId_fkey`;

-- DropForeignKey
ALTER TABLE `booking` DROP FOREIGN KEY `Booking_priestId_fkey`;

-- DropForeignKey
ALTER TABLE `booking` DROP FOREIGN KEY `Booking_userId_fkey`;

-- DropForeignKey
ALTER TABLE `donationrecord` DROP FOREIGN KEY `DonationRecord_donationItemId_fkey`;

-- DropForeignKey
ALTER TABLE `eventbooking` DROP FOREIGN KEY `EventBooking_eventId_fkey`;

-- DropForeignKey
ALTER TABLE `eventbooking` DROP FOREIGN KEY `EventBooking_userId_fkey`;

-- DropForeignKey
ALTER TABLE `eventsponsorship` DROP FOREIGN KEY `EventSponsorship_eventId_fkey`;

-- DropForeignKey
ALTER TABLE `eventsponsorship` DROP FOREIGN KEY `EventSponsorship_sponsorshipTypeId_fkey`;

-- DropForeignKey
ALTER TABLE `rolepermission` DROP FOREIGN KEY `RolePermission_permissionId_fkey`;

-- DropForeignKey
ALTER TABLE `rolepermission` DROP FOREIGN KEY `RolePermission_roleId_fkey`;

-- DropForeignKey
ALTER TABLE `sponsorshipbooking` DROP FOREIGN KEY `SponsorshipBooking_eventSponsorshipId_fkey`;

-- DropForeignKey
ALTER TABLE `sponsorshipbooking` DROP FOREIGN KEY `SponsorshipBooking_userId_fkey`;

-- DropForeignKey
ALTER TABLE `user` DROP FOREIGN KEY `User_priestId_fkey`;

-- DropForeignKey
ALTER TABLE `userrole` DROP FOREIGN KEY `UserRole_roleId_fkey`;

-- DropForeignKey
ALTER TABLE `userrole` DROP FOREIGN KEY `UserRole_userId_fkey`;

-- AlterTable
ALTER TABLE `event` ADD COLUMN `featuredMediaId` INTEGER NULL;

-- AlterTable
ALTER TABLE `pooja` ADD COLUMN `featuredMediaId` INTEGER NULL;

-- AlterTable
ALTER TABLE `priest` ADD COLUMN `featuredMediaId` INTEGER NULL;

-- CreateTable
CREATE TABLE `poojamedia` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `poojaId` INTEGER NOT NULL,
    `mediaId` INTEGER NOT NULL,
    `sortOrder` INTEGER NOT NULL DEFAULT 0,

    INDEX `poojamedia_poojaId_idx`(`poojaId`),
    INDEX `poojamedia_mediaId_idx`(`mediaId`),
    UNIQUE INDEX `poojamedia_poojaId_mediaId_key`(`poojaId`, `mediaId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `eventmedia` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `eventId` INTEGER NOT NULL,
    `mediaId` INTEGER NOT NULL,
    `sortOrder` INTEGER NOT NULL DEFAULT 0,

    INDEX `eventmedia_eventId_idx`(`eventId`),
    INDEX `eventmedia_mediaId_idx`(`mediaId`),
    UNIQUE INDEX `eventmedia_eventId_mediaId_key`(`eventId`, `mediaId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `album` ADD CONSTRAINT `album_coverId_fkey` FOREIGN KEY (`coverId`) REFERENCES `mediaasset`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `albumitem` ADD CONSTRAINT `albumitem_albumId_fkey` FOREIGN KEY (`albumId`) REFERENCES `album`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `albumitem` ADD CONSTRAINT `albumitem_mediaId_fkey` FOREIGN KEY (`mediaId`) REFERENCES `mediaasset`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `priest` ADD CONSTRAINT `priest_featuredMediaId_fkey` FOREIGN KEY (`featuredMediaId`) REFERENCES `mediaasset`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `pooja` ADD CONSTRAINT `pooja_featuredMediaId_fkey` FOREIGN KEY (`featuredMediaId`) REFERENCES `mediaasset`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `availabilityslot` ADD CONSTRAINT `availabilityslot_priestId_fkey` FOREIGN KEY (`priestId`) REFERENCES `priest`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `rolepermission` ADD CONSTRAINT `rolepermission_roleId_fkey` FOREIGN KEY (`roleId`) REFERENCES `role`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `rolepermission` ADD CONSTRAINT `rolepermission_permissionId_fkey` FOREIGN KEY (`permissionId`) REFERENCES `permission`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `booking` ADD CONSTRAINT `booking_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `user`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `booking` ADD CONSTRAINT `booking_poojaId_fkey` FOREIGN KEY (`poojaId`) REFERENCES `pooja`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `booking` ADD CONSTRAINT `booking_priestId_fkey` FOREIGN KEY (`priestId`) REFERENCES `priest`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `donationrecord` ADD CONSTRAINT `donationrecord_donationItemId_fkey` FOREIGN KEY (`donationItemId`) REFERENCES `donationitem`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `user` ADD CONSTRAINT `user_priestId_fkey` FOREIGN KEY (`priestId`) REFERENCES `priest`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `userrole` ADD CONSTRAINT `userrole_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `user`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `userrole` ADD CONSTRAINT `userrole_roleId_fkey` FOREIGN KEY (`roleId`) REFERENCES `role`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `event` ADD CONSTRAINT `event_featuredMediaId_fkey` FOREIGN KEY (`featuredMediaId`) REFERENCES `mediaasset`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `eventbooking` ADD CONSTRAINT `eventbooking_eventId_fkey` FOREIGN KEY (`eventId`) REFERENCES `event`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `eventbooking` ADD CONSTRAINT `eventbooking_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `user`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `eventsponsorship` ADD CONSTRAINT `eventsponsorship_eventId_fkey` FOREIGN KEY (`eventId`) REFERENCES `event`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `eventsponsorship` ADD CONSTRAINT `eventsponsorship_sponsorshipTypeId_fkey` FOREIGN KEY (`sponsorshipTypeId`) REFERENCES `sponsorshiptype`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `sponsorshipbooking` ADD CONSTRAINT `sponsorshipbooking_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `user`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `sponsorshipbooking` ADD CONSTRAINT `sponsorshipbooking_eventSponsorshipId_fkey` FOREIGN KEY (`eventSponsorshipId`) REFERENCES `eventsponsorship`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `poojamedia` ADD CONSTRAINT `poojamedia_poojaId_fkey` FOREIGN KEY (`poojaId`) REFERENCES `pooja`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `poojamedia` ADD CONSTRAINT `poojamedia_mediaId_fkey` FOREIGN KEY (`mediaId`) REFERENCES `mediaasset`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `eventmedia` ADD CONSTRAINT `eventmedia_eventId_fkey` FOREIGN KEY (`eventId`) REFERENCES `event`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `eventmedia` ADD CONSTRAINT `eventmedia_mediaId_fkey` FOREIGN KEY (`mediaId`) REFERENCES `mediaasset`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- RenameIndex
ALTER TABLE `album` RENAME INDEX `Album_slug_key` TO `album_slug_key`;

-- RenameIndex
ALTER TABLE `albumitem` RENAME INDEX `AlbumItem_albumId_idx` TO `albumitem_albumId_idx`;

-- RenameIndex
ALTER TABLE `albumitem` RENAME INDEX `AlbumItem_mediaId_idx` TO `albumitem_mediaId_idx`;

-- RenameIndex
ALTER TABLE `availabilityslot` RENAME INDEX `AvailabilitySlot_priestId_idx` TO `availabilityslot_priestId_idx`;

-- RenameIndex
ALTER TABLE `eventsponsorship` RENAME INDEX `EventSponsorship_eventId_sponsorshipTypeId_key` TO `eventsponsorship_eventId_sponsorshipTypeId_key`;

-- RenameIndex
ALTER TABLE `mediaasset` RENAME INDEX `MediaAsset_url_key` TO `mediaasset_url_key`;

-- RenameIndex
ALTER TABLE `permission` RENAME INDEX `Permission_name_key` TO `permission_name_key`;

-- RenameIndex
ALTER TABLE `role` RENAME INDEX `Role_name_key` TO `role_name_key`;

-- RenameIndex
ALTER TABLE `sponsorshiptype` RENAME INDEX `SponsorshipType_name_key` TO `sponsorshiptype_name_key`;

-- RenameIndex
ALTER TABLE `staticpage` RENAME INDEX `StaticPage_slug_key` TO `staticpage_slug_key`;

-- RenameIndex
ALTER TABLE `user` RENAME INDEX `User_email_key` TO `user_email_key`;

-- RenameIndex
ALTER TABLE `user` RENAME INDEX `User_priestId_key` TO `user_priestId_key`;

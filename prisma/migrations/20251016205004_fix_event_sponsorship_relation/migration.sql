-- CreateIndex
CREATE INDEX `eventsponsorship_eventId_idx` ON `eventsponsorship`(`eventId`);

-- RenameIndex
ALTER TABLE `eventsponsorship` RENAME INDEX `eventsponsorship_sponsorshipTypeId_fkey` TO `eventsponsorship_sponsorshipTypeId_idx`;

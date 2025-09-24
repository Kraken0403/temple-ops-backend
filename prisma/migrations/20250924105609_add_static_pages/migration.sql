/*
  Warnings:

  - You are about to drop the column `template` on the `staticpage` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `staticpage` DROP COLUMN `template`,
    ADD COLUMN `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3);

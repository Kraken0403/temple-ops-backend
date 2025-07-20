// src/donations/donations.module.ts
import { Module } from '@nestjs/common'
import { PrismaService } from '../prisma.service'
import { DonationItemService } from './donation-item.service'
import { DonationItemController } from './donation-item.controller'
import { DonationRecordService } from './donation-record.service'
import { DonationRecordController } from './donation-record.controller'

@Module({
  controllers: [
    DonationItemController,
    DonationRecordController
  ],
  providers: [
    PrismaService,
    DonationItemService,
    DonationRecordService
  ],
})
export class DonationsModule {}

import { Module } from '@nestjs/common'
import { SponsorshipController } from './sponsorship.controller'
import { SponsorshipService } from './sponsorship.service'
import { PrismaService } from '../prisma.service'
import { NotificationsService } from '../notifications/notifications.service'

@Module({
  controllers: [SponsorshipController],
  providers: [SponsorshipService, PrismaService, NotificationsService],
  exports: [SponsorshipService],
})
export class SponsorshipModule {}

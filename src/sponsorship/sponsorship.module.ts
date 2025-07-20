import { Module } from '@nestjs/common'
import { SponsorshipService } from './sponsorship.service'
import { SponsorshipController } from './sponsorship.controller'
import { PrismaService } from '../prisma.service'

@Module({
  controllers: [SponsorshipController],
  providers: [SponsorshipService, PrismaService],
})
export class SponsorshipModule {}

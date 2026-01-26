import { Module } from '@nestjs/common'
import { PrismaService } from '../prisma.service'
import { EventOccurrencesController } from './event-occurrences.controller'
import { EventOccurrencesService } from './event-occurrences.service'

@Module({
  controllers: [EventOccurrencesController],
  providers: [EventOccurrencesService, PrismaService],
})
export class EventOccurrencesModule {}

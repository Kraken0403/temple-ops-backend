import { Module } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { EventsService } from './events.service';
import { EventsController } from './events.controller';

@Module({
  providers: [EventsService, PrismaService],
  controllers: [EventsController],
})
export class EventsModule {}

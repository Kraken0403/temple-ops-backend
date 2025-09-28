// src/events/events.module.ts
import { Module } from '@nestjs/common'
import { EventsService } from './events.service'
import { EventsController } from './events.controller'
import { PrismaService } from '../prisma.service'
import { NotificationsModule } from '../notifications/notifications.module'

@Module({
  imports: [NotificationsModule], 
  controllers: [EventsController],
  providers: [EventsService, PrismaService],
})
export class EventsModule {}

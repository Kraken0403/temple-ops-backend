import { Module } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { BookingService } from './booking.service';
import { BookingController } from './booking.controller';

import { NotificationsModule } from '../notifications/notifications.module'

@Module({
  imports: [NotificationsModule],
  providers: [BookingService, PrismaService],
  controllers: [BookingController],
})
export class BookingModule {}

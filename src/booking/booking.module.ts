import { Module } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { BookingService } from './booking.service';
import { BookingController } from './booking.controller';

@Module({
  providers: [BookingService, PrismaService],
  controllers: [BookingController],
})
export class BookingModule {}

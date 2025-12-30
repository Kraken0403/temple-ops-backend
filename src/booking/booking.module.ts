// src/booking/booking.module.ts
import { Module } from '@nestjs/common'
import { PrismaService } from '../prisma.service'
import { BookingService } from './booking.service'
import { BookingController } from './booking.controller'
import { NotificationsModule } from '../notifications/notifications.module'
import { CouponsModule } from '../coupons/coupons.module'   // ✅ add this
import { DistanceService } from '../common/distance.service'

@Module({
  imports: [NotificationsModule, CouponsModule],            // ✅ include it
  providers: [BookingService, PrismaService, DistanceService],
  controllers: [BookingController],
})
export class BookingModule {}

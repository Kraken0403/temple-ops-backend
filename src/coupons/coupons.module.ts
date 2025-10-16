// src/coupons/coupons.module.ts
import { Module } from '@nestjs/common'
import { CouponsService } from './coupons.service'
import { CouponsController } from './coupons.controller'
import { PrismaService } from '../prisma.service'

@Module({
  providers: [CouponsService, PrismaService],
  controllers: [CouponsController],
  exports: [CouponsService], // ✅ export it
})
export class CouponsModule {}

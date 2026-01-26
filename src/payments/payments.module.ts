// src/payments/payments.module.ts
import { Module } from '@nestjs/common'
import { PaymentsService } from './payments.service'
import { PaymentsController } from './payments.controller'
import { PrismaModule } from '../prisma/prisma.module'
import { CouponsModule } from '../coupons/coupons.module'

@Module({
  imports: [
    PrismaModule,
    CouponsModule, // REQUIRED because you inject CouponsService
  ],
  controllers: [PaymentsController],
  providers: [PaymentsService],
})
export class PaymentsModule {}

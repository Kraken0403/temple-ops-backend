import { Injectable, Logger } from '@nestjs/common'
import { PrismaService } from '../prisma.service'
import { CouponsService } from '../coupons/coupons.service'
import { Prisma } from '@prisma/client'
import * as paypal from '@paypal/checkout-server-sdk'
import { paypalClient } from './paypal.client'

@Injectable()
export class PaymentsService {
  private readonly logger = new Logger(PaymentsService.name)
  private client = paypalClient()

  constructor(
    private readonly prisma: PrismaService,
    private readonly coupons: CouponsService,
  ) {}

  /* ───────────────────────── Helpers ───────────────────────── */

  private getPaypalItemName(purpose: string) {
    switch (purpose) {
      case 'EVENT':
        return 'Event Registration'
      case 'SERVICES':
        return 'Service Payment'
      case 'DONATION':
        return 'Donation'
      case 'SPONSORSHIP':
        return 'Sponsorship Contribution'
      default:
        return 'Payment'
    }
  }

  /* ─────────────────────────────────────────
     CREATE PAYPAL ORDER
     ───────────────────────────────────────── */

  async createPaypalOrder(dto: {
    purpose: 'EVENT' | 'SERVICES' | 'DONATION' | 'SPONSORSHIP'
    referenceId: number
    amount: number
    currency?: string
    userId?: number
  }) {
    if (dto.amount <= 0) {
      throw new Error('Amount must be greater than zero')
    }

    const booking = await this.prisma.eventBooking.findUnique({
      where: { id: dto.referenceId },
    })

    const currency = dto.currency ?? 'USD'
    const amountValue = dto.amount.toFixed(2)

    // 1️⃣ Create internal payment record
    const payment = await this.prisma.payment.create({
      data: {
        purpose: dto.purpose,
        referenceId: dto.referenceId,
        amount: dto.amount,
        currency,
        provider: 'PAYPAL',
        status: 'CREATED',
      },
    })
    

    // 2️⃣ Build PayPal order
    const request = new paypal.orders.OrdersCreateRequest()
    request.prefer('return=representation')

    request.requestBody({
      intent: 'CAPTURE',
      purchase_units: [
        {
          reference_id: `PAYMENT_${payment.id}`,
          amount: {
            currency_code: currency,
            value: amountValue,
          },
          description: this.getPaypalItemName(dto.purpose),
        },
      ],
      application_context: {
        brand_name: 'Sanatan Mandir',
        landing_page: 'NO_PREFERENCE',
        user_action: 'PAY_NOW',
        shipping_preference: 'NO_SHIPPING',
      },
    })

    // 3️⃣ Execute PayPal order
    const order = await this.client.execute(request)

    // 4️⃣ Store PayPal order ID
    await this.prisma.payment.update({
      where: { id: payment.id },
      data: {
        providerOrderId: order.result.id,
      },
    })

    return { orderId: order.result.id }
  }

  /* ─────────────────────────────────────────
     CAPTURE PAYPAL ORDER (DIRECT FLOW)
     ───────────────────────────────────────── */

     async capturePaypalOrder(orderId: string) {
      const request = new paypal.orders.OrdersCaptureRequest(orderId)
      const capture = await this.client.execute(request)
    
      console.log('PAYMENT CAPTURED')
      const txnId =
        capture.result.purchase_units?.[0]?.payments?.captures?.[0]?.id
    
      if (!txnId) {
        throw new Error('PayPal capture succeeded but txnId missing')
      }
    
      // 🔥 THIS WAS MISSING
      await this.handleCompletedPayment(orderId, txnId)
    
      return capture.result
    }
    

  /* ─────────────────────────────────────────
     PAYMENT SUCCESS HANDLER
     (Webhook OR Capture)
     ───────────────────────────────────────── */

  async handleCompletedPayment(orderId: string, txnId: string) {
    const payment = await this.prisma.payment.findFirst({
      where: { providerOrderId: orderId },
    })

    console.log('HANDLE COMPLETE RAN')


    if (!payment) {
      this.logger.warn(`Payment not found for orderId ${orderId}`)
      return
    }

    if (payment.status === 'COMPLETED') return

    await this.prisma.payment.update({
      where: { id: payment.id },
      data: {
        status: 'COMPLETED',
        providerTxnId: txnId,
      },
    })

    // 2️⃣ Handle EVENT booking confirmation
    if (payment.purpose === 'EVENT') {
      await this.prisma.$transaction(async (tx: Prisma.TransactionClient) => {
        const booking = await tx.eventBooking.findUnique({
          where: { id: payment.referenceId },
        })

        if (!booking) {
          throw new Error(`Booking ${payment.referenceId} not found`)
        }

        // 🔒 Always attach paymentId
        if (!booking.paymentId) {
          await tx.eventBooking.update({
            where: { id: booking.id },
            data: {
              paymentId: payment.id,
            },
          })
        }

        // ✅ Confirm booking once
        if (booking.status !== 'CONFIRMED') {
          await tx.eventBooking.update({
            where: { id: booking.id },
            data: {
              status: 'CONFIRMED',
            },
          })

          await tx.eventOccurrence.update({
            where: { id: booking.eventOccurrenceId },
            data: {
              bookedCount: { increment: booking.pax },
            },
          })
        }

        // 🎟️ Record coupon redemption AFTER payment
        const discount = booking.discountAmount ?? 0

        if (booking.couponCode && discount > 0) {
          await this.coupons.recordRedemption(
            {
              couponCode: booking.couponCode,
              amountApplied: discount,
              userId: booking.userId ?? null,
              target: {
                type: 'event',
                eventBookingId: booking.id,
              },
            },
            tx,
          )
        }
      })
    }
  }
}

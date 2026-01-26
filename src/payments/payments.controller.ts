import {
    Controller,
    Post,
    Body,
  } from '@nestjs/common'
  import { PaymentsService } from './payments.service'
  
  @Controller('payments')
  export class PaymentsController {
    constructor(private readonly service: PaymentsService) {}

      // ⚠️ TEMP — REMOVE AFTER TESTING
    @Post('test/complete')
    async testComplete(@Body() body: { orderId: string; txnId: string }) {
      await this.service.handleCompletedPayment(
        body.orderId,
        body.txnId,
      )
      return { ok: true }
    }

    @Post('paypal/create')
    create(
      @Body()
      body: {
        purpose: 'EVENT' | 'SERVICES' | 'DONATION' | 'SPONSORSHIP'
        referenceId: number
        amount: number
        currency?: string
        userId?: number
      },
    ) {
      return this.service.createPaypalOrder(body)
    }
  
    @Post('paypal/capture')
    capture(
      @Body()
      body: {
        orderId: string
      },
    ) {
      return this.service.capturePaypalOrder(body.orderId)
    }
  
    @Post('webhook/paypal')
    async webhook(@Body() body: any) {
      const event = body.event_type
  
      if (event === 'PAYMENT.CAPTURE.COMPLETED') {
        const orderId =
          body.resource?.supplementary_data?.related_ids?.order_id
        const txnId = body.resource?.id
  
        if (orderId && txnId) {
          await this.service.handleCompletedPayment(orderId, txnId)
        }
      }
  
      return { ok: true }
    }
  }
  
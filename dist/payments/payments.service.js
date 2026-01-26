"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var PaymentsService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma.service");
const coupons_service_1 = require("../coupons/coupons.service");
const paypal = require("@paypal/checkout-server-sdk");
const paypal_client_1 = require("./paypal.client");
let PaymentsService = PaymentsService_1 = class PaymentsService {
    constructor(prisma, coupons) {
        this.prisma = prisma;
        this.coupons = coupons;
        this.logger = new common_1.Logger(PaymentsService_1.name);
        this.client = (0, paypal_client_1.paypalClient)();
    }
    /* ───────────────────────── Helpers ───────────────────────── */
    getPaypalItemName(purpose) {
        switch (purpose) {
            case 'EVENT':
                return 'Event Registration';
            case 'SERVICES':
                return 'Service Payment';
            case 'DONATION':
                return 'Donation';
            case 'SPONSORSHIP':
                return 'Sponsorship Contribution';
            default:
                return 'Payment';
        }
    }
    /* ─────────────────────────────────────────
       CREATE PAYPAL ORDER
       ───────────────────────────────────────── */
    async createPaypalOrder(dto) {
        if (dto.amount <= 0) {
            throw new Error('Amount must be greater than zero');
        }
        const booking = await this.prisma.eventBooking.findUnique({
            where: { id: dto.referenceId },
        });
        const currency = dto.currency ?? 'USD';
        const amountValue = dto.amount.toFixed(2);
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
        });
        // 2️⃣ Build PayPal order
        const request = new paypal.orders.OrdersCreateRequest();
        request.prefer('return=representation');
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
        });
        // 3️⃣ Execute PayPal order
        const order = await this.client.execute(request);
        // 4️⃣ Store PayPal order ID
        await this.prisma.payment.update({
            where: { id: payment.id },
            data: {
                providerOrderId: order.result.id,
            },
        });
        return { orderId: order.result.id };
    }
    /* ─────────────────────────────────────────
       CAPTURE PAYPAL ORDER (DIRECT FLOW)
       ───────────────────────────────────────── */
    async capturePaypalOrder(orderId) {
        const request = new paypal.orders.OrdersCaptureRequest(orderId);
        const capture = await this.client.execute(request);
        console.log('PAYMENT CAPTURED');
        const txnId = capture.result.purchase_units?.[0]?.payments?.captures?.[0]?.id;
        if (!txnId) {
            throw new Error('PayPal capture succeeded but txnId missing');
        }
        // 🔥 THIS WAS MISSING
        await this.handleCompletedPayment(orderId, txnId);
        return capture.result;
    }
    /* ─────────────────────────────────────────
       PAYMENT SUCCESS HANDLER
       (Webhook OR Capture)
       ───────────────────────────────────────── */
    async handleCompletedPayment(orderId, txnId) {
        const payment = await this.prisma.payment.findFirst({
            where: { providerOrderId: orderId },
        });
        console.log('HANDLE COMPLETE RAN');
        if (!payment) {
            this.logger.warn(`Payment not found for orderId ${orderId}`);
            return;
        }
        if (payment.status === 'COMPLETED')
            return;
        await this.prisma.payment.update({
            where: { id: payment.id },
            data: {
                status: 'COMPLETED',
                providerTxnId: txnId,
            },
        });
        // 2️⃣ Handle EVENT booking confirmation
        if (payment.purpose === 'EVENT') {
            await this.prisma.$transaction(async (tx) => {
                const booking = await tx.eventBooking.findUnique({
                    where: { id: payment.referenceId },
                });
                if (!booking) {
                    throw new Error(`Booking ${payment.referenceId} not found`);
                }
                // 🔒 Always attach paymentId
                if (!booking.paymentId) {
                    await tx.eventBooking.update({
                        where: { id: booking.id },
                        data: {
                            paymentId: payment.id,
                        },
                    });
                }
                // ✅ Confirm booking once
                if (booking.status !== 'CONFIRMED') {
                    await tx.eventBooking.update({
                        where: { id: booking.id },
                        data: {
                            status: 'CONFIRMED',
                        },
                    });
                    await tx.eventOccurrence.update({
                        where: { id: booking.eventOccurrenceId },
                        data: {
                            bookedCount: { increment: booking.pax },
                        },
                    });
                }
                // 🎟️ Record coupon redemption AFTER payment
                const discount = booking.discountAmount ?? 0;
                if (booking.couponCode && discount > 0) {
                    await this.coupons.recordRedemption({
                        couponCode: booking.couponCode,
                        amountApplied: discount,
                        userId: booking.userId ?? null,
                        target: {
                            type: 'event',
                            eventBookingId: booking.id,
                        },
                    }, tx);
                }
            });
        }
    }
};
exports.PaymentsService = PaymentsService;
exports.PaymentsService = PaymentsService = PaymentsService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        coupons_service_1.CouponsService])
], PaymentsService);
//# sourceMappingURL=payments.service.js.map
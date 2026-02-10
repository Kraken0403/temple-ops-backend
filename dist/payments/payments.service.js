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
const notifications_service_1 = require("../notifications/notifications.service");
let PaymentsService = PaymentsService_1 = class PaymentsService {
    constructor(prisma, coupons, notifications) {
        this.prisma = prisma;
        this.coupons = coupons;
        this.notifications = notifications;
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
        // ✅ PURPOSE-AWARE VALIDATION
        switch (dto.purpose) {
            case 'EVENT':
                await this.prisma.eventBooking.findUniqueOrThrow({
                    where: { id: dto.referenceId },
                });
                break;
            case 'SERVICES':
                await this.prisma.booking.findUniqueOrThrow({
                    where: { id: dto.referenceId },
                });
                break;
            case 'DONATION':
                await this.prisma.donationRecord.findUniqueOrThrow({
                    where: { id: dto.referenceId },
                });
                break;
            case 'SPONSORSHIP':
                await this.prisma.sponsorshipBooking.findUniqueOrThrow({
                    where: { id: dto.referenceId },
                });
                break;
        }
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
        if (!payment) {
            this.logger.warn(`Payment not found for orderId ${orderId}`);
            return;
        }
        // 🔒 Idempotency
        if (payment.status === 'COMPLETED')
            return;
        // 1️⃣ Mark payment completed (FAST)
        await this.prisma.payment.update({
            where: { id: payment.id },
            data: {
                status: 'COMPLETED',
                providerTxnId: txnId,
            },
        });
        // 2️⃣ Route by purpose
        switch (payment.purpose) {
            /* ───────────── EVENT ───────────── */
            case 'EVENT': {
                let confirmedBookingId = null;
                await this.prisma.$transaction(async (tx) => {
                    const booking = await tx.eventBooking.findUnique({
                        where: { id: payment.referenceId },
                    });
                    if (!booking) {
                        throw new Error(`EventBooking ${payment.referenceId} not found`);
                    }
                    // Attach payment once
                    if (!booking.paymentId) {
                        await tx.eventBooking.update({
                            where: { id: booking.id },
                            data: { paymentId: payment.id },
                        });
                    }
                    if (booking.status !== 'CONFIRMED') {
                        await tx.eventBooking.update({
                            where: { id: booking.id },
                            data: { status: 'CONFIRMED' },
                        });
                        await tx.eventOccurrence.update({
                            where: { id: booking.eventOccurrenceId },
                            data: {
                                bookedCount: { increment: booking.pax },
                            },
                        });
                    }
                    // Coupon redemption (DB only)
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
                    confirmedBookingId = booking.id;
                });
                // 📧 AFTER COMMIT
                if (confirmedBookingId) {
                    await this.notifications.sendEventBookingCreated(confirmedBookingId);
                }
                break;
            }
            /* ───────────── SERVICES (POOJA) ───────────── */
            case 'SERVICES': {
                let confirmedBookingId = null;
                await this.prisma.$transaction(async (tx) => {
                    const booking = await tx.booking.findUnique({
                        where: { id: payment.referenceId },
                    });
                    if (!booking) {
                        throw new Error(`Pooja Booking ${payment.referenceId} not found`);
                    }
                    // 🔒 Idempotency
                    if (booking.status === 'confirmed') {
                        confirmedBookingId = booking.id;
                        return;
                    }
                    // Confirm booking
                    await tx.booking.update({
                        where: { id: booking.id },
                        data: { status: 'confirmed' },
                    });
                    // Coupon redemption
                    const discount = booking.discountAmount ?? 0;
                    if (booking.couponCode && discount > 0) {
                        await this.coupons.recordRedemption({
                            couponCode: booking.couponCode,
                            amountApplied: discount,
                            userId: booking.userId ?? null,
                            target: {
                                type: 'pooja',
                                poojaBookingId: booking.id,
                            },
                        }, tx);
                    }
                    confirmedBookingId = booking.id;
                });
                // 📧 AFTER COMMIT
                if (confirmedBookingId) {
                    await this.notifications.sendBookingConfirmed(confirmedBookingId);
                }
                break;
            }
            /* ───────────── DONATION ───────────── */
            case 'DONATION': {
                // 1️⃣ Fetch donation
                const donation = await this.prisma.donationRecord.findUnique({
                    where: { id: payment.referenceId },
                });
                if (!donation) {
                    throw new Error(`DonationRecord ${payment.referenceId} not found`);
                }
                // 🔒 Idempotency guard (webhook-safe)
                if (donation.status === 'COMPLETED') {
                    return;
                }
                // 2️⃣ Mark donation as completed
                await this.prisma.donationRecord.update({
                    where: { id: donation.id },
                    data: {
                        status: 'COMPLETED',
                    },
                });
                // 3️⃣ Send thank-you email ONLY AFTER payment
                await this.notifications.sendDonationReceived(donation.id);
                break;
            }
            /* ───────────── SPONSORSHIP ───────────── */
            case 'SPONSORSHIP': {
                let confirmedBookingId = null;
                await this.prisma.$transaction(async (tx) => {
                    const booking = await tx.sponsorshipBooking.findUnique({
                        where: { id: payment.referenceId },
                        include: {
                            eventSponsorship: {
                                include: { bookings: true },
                            },
                        },
                    });
                    if (!booking) {
                        throw new Error(`SponsorshipBooking ${payment.referenceId} not found`);
                    }
                    if (booking.status === 'confirmed') {
                        confirmedBookingId = booking.id;
                        return;
                    }
                    const confirmedCount = booking.eventSponsorship.bookings.filter((b) => b.status === 'confirmed').length;
                    if (confirmedCount >= booking.eventSponsorship.maxSlots) {
                        throw new Error('Sponsorship slots exhausted');
                    }
                    await tx.sponsorshipBooking.update({
                        where: { id: booking.id },
                        data: { status: 'confirmed' },
                    });
                    confirmedBookingId = booking.id;
                });
                // 📧 AFTER COMMIT
                if (confirmedBookingId) {
                    await this.notifications.sendSponsorshipBooked(confirmedBookingId);
                }
                break;
            }
        }
    }
};
exports.PaymentsService = PaymentsService;
exports.PaymentsService = PaymentsService = PaymentsService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        coupons_service_1.CouponsService,
        notifications_service_1.NotificationsService])
], PaymentsService);
//# sourceMappingURL=payments.service.js.map
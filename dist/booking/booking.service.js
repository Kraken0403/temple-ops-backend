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
Object.defineProperty(exports, "__esModule", { value: true });
exports.BookingService = void 0;
// src/booking/booking.service.ts
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma.service");
const notifications_service_1 = require("../notifications/notifications.service");
const timezone_util_1 = require("../common/timezone.util");
const coupons_service_1 = require("../coupons/coupons.service");
const validate_coupon_dto_1 = require("../coupons/dto/validate-coupon.dto");
const distance_service_1 = require("../common/distance.service");
let BookingService = class BookingService {
    constructor(prisma, notifications, coupons, distanceService) {
        this.prisma = prisma;
        this.notifications = notifications;
        this.coupons = coupons;
        this.distanceService = distanceService;
        this.tzUtil = new timezone_util_1.TimezoneUtil(prisma);
    }
    // ─────────────────────────────────────────────
    // SETTINGS (single source of truth)
    // ─────────────────────────────────────────────
    async getTravelSettings() {
        const settings = await this.prisma.settings.findUnique({
            where: { id: 1 },
            include: { primaryVenue: true }, // ✅ ADD
        });
        if (!settings) {
            throw new common_1.BadRequestException('Travel settings not configured');
        }
        // ✅ ensure primary venue exists + has coordinates
        if (!settings.primaryVenue ||
            settings.primaryVenue.latitude == null ||
            settings.primaryVenue.longitude == null) {
            throw new common_1.BadRequestException('Primary venue location not configured');
        }
        return {
            ratePerUnit: settings.travelRate, // $ per unit
            freeUnits: settings.freeTravelUnits, // free units
            maxUnits: settings.maxServiceUnits, // max units
            unit: settings.travelUnit || 'mile',
            // keep this if you want, doesn't affect anything
            avgSpeed: settings.travelAvgSpeed || 25,
            // ✅ base coords for calculation
            baseLat: settings.primaryVenue.latitude,
            baseLng: settings.primaryVenue.longitude,
        };
    }
    // ─────────────────────────────────────────────
    // QUOTE CALCULATION
    // ─────────────────────────────────────────────
    async calculateQuote(params) {
        const pooja = await this.prisma.pooja.findUnique({
            where: { id: params.poojaId },
            include: { venue: true },
        });
        if (!pooja || pooja.deletedAt) {
            throw new common_1.BadRequestException('Pooja not available');
        }
        const settings = await this.getTravelSettings();
        // 🔑 SINGLE SOURCE OF TRUTH
        const isCustomVenue = pooja.isOutsideVenue === true &&
            params.venueType === 'CUSTOM';
        let travelDistance = null;
        let travelCost = 0;
        // --------------------------------------------------
        // 🚗 TRAVEL CALCULATION (ONLY IF USER CHOSE CUSTOM)
        // --------------------------------------------------
        if (isCustomVenue) {
            if (params.venueLat == null || params.venueLng == null) {
                throw new common_1.BadRequestException('Location required for outside venue pooja');
            }
            const distanceKm = this.distanceService.getDistanceKm(settings.baseLat, settings.baseLng, params.venueLat, params.venueLng);
            const distanceMiles = distanceKm * 0.621371;
            travelDistance = Number(distanceMiles.toFixed(2));
            if (travelDistance > settings.maxUnits) {
                throw new common_1.BadRequestException('Outside serviceable area');
            }
            const billableUnits = Math.max(0, travelDistance - settings.freeUnits);
            travelCost = Number((billableUnits * settings.ratePerUnit).toFixed(2));
        }
        // --------------------------------------------------
        // 💰 BASE AMOUNT (CORRECTED)
        // --------------------------------------------------
        if (isCustomVenue && pooja.outsideAmount == null) {
            throw new common_1.BadRequestException('Outside venue selected but outside amount is not configured');
        }
        const baseAmount = isCustomVenue
            ? pooja.outsideAmount ?? 0
            : pooja.amount ?? 0;
        const subtotal = baseAmount + travelCost;
        // --------------------------------------------------
        // 🎟️ COUPON / DISCOUNT
        // --------------------------------------------------
        let discount = 0;
        let total = subtotal;
        if (params.couponCode) {
            const quote = await this.coupons.validateAndQuote(params.couponCode, {
                kind: validate_coupon_dto_1.ValidateKind.POOJA,
                poojaId: params.poojaId,
                userId: params.userId,
            });
            if (!quote.valid) {
                throw new common_1.BadRequestException(quote.reason || 'Invalid coupon');
            }
            discount = quote.discount ?? 0;
            total =
                quote.total ??
                    Math.max(0, subtotal - discount);
        }
        // --------------------------------------------------
        // 📦 RESPONSE
        // --------------------------------------------------
        return {
            baseAmount,
            travelDistanceUnits: travelDistance,
            travelRateApplied: settings.ratePerUnit,
            freeUnits: settings.freeUnits,
            travelCost,
            subtotal,
            discount,
            total,
            travelUnit: settings.unit,
        };
    }
    // ─────────────────────────────────────────────
    // PUBLIC QUOTE
    // ─────────────────────────────────────────────
    async quote(params) {
        return this.calculateQuote(params);
    }
    // ─────────────────────────────────────────────
    // CREATE BOOKING
    // ─────────────────────────────────────────────
    async create(dto) {
        const bookingDate = await this.tzUtil.toUTC(dto.bookingDate);
        const start = await this.tzUtil.toUTC(dto.start);
        const end = await this.tzUtil.toUTC(dto.end);
        const pooja = await this.prisma.pooja.findUnique({
            where: { id: dto.poojaId },
            include: { priests: true },
        });
        if (!pooja || pooja.deletedAt) {
            throw new common_1.BadRequestException('Pooja not available');
        }
        const priest = await this.prisma.priest.findUnique({
            where: { id: dto.priestId },
        });
        if (!priest)
            throw new common_1.BadRequestException('Priest not found');
        if (!pooja.priests.some(p => p.id === dto.priestId)) {
            throw new common_1.BadRequestException('This priest is not assigned to the selected pooja');
        }
        const pricing = await this.calculateQuote({
            poojaId: dto.poojaId,
            userId: dto.userId,
            venueLat: dto.venueLat,
            venueLng: dto.venueLng,
            venueType: dto.venueType, // 🔑
            couponCode: dto.couponCode,
        });
        const created = await this.prisma.booking.create({
            data: {
                userId: dto.userId ?? undefined,
                poojaId: dto.poojaId,
                priestId: dto.priestId,
                bookingDate,
                start,
                end,
                status: 'pending',
                // 🔥 REQUIRED SNAPSHOT
                venueType: dto.venueType, // TEMPLE | CUSTOM
                amountAtBooking: pricing.total,
                poojaNameAtBooking: pooja.name,
                priestNameAtBooking: priest.name ?? null,
                userName: dto.userName || null,
                userEmail: dto.userEmail || null,
                userPhone: dto.userPhone || null,
                venueAddress: dto.venueAddress ?? undefined,
                venueState: dto.venueState ?? undefined,
                venueZip: dto.venueZip ?? undefined,
                // only present for CUSTOM venue
                venueLat: dto.venueType === 'CUSTOM' ? dto.venueLat ?? undefined : undefined,
                venueLng: dto.venueType === 'CUSTOM' ? dto.venueLng ?? undefined : undefined,
                couponCode: dto.couponCode?.trim() || null,
                discountAmount: pricing.discount,
                subtotal: pricing.subtotal,
                total: pricing.total,
                travelDistance: pricing.travelDistanceUnits,
                travelRate: pricing.travelRateApplied,
                freeTravelUnits: pricing.freeUnits,
                travelCost: pricing.travelCost,
                travelUnit: pricing.travelUnit,
            },
        });
        // if (dto.couponCode && pricing.discount > 0) {
        //   await this.coupons.recordRedemption({
        //     couponCode: dto.couponCode.trim(),
        //     amountApplied: pricing.discount,
        //     userId: dto.userId ?? null,
        //     target: { type: 'pooja', poojaBookingId: created.id },
        //   })
        // }
        // await this.notifications.sendBookingCreated(created.id)
        return {
            ...created,
            bookingDate: await this.tzUtil.fromUTC(created.bookingDate),
            start: await this.tzUtil.fromUTC(created.start),
            end: await this.tzUtil.fromUTC(created.end),
        };
    }
    // ─────────────────────────────────────────────
    // READ / UPDATE / DELETE (UNCHANGED)
    // ─────────────────────────────────────────────
    async findAll() {
        const list = await this.prisma.booking.findMany({
            orderBy: { createdAt: 'desc' },
        });
        return Promise.all(list.map(async (b) => ({
            ...b,
            bookingDate: await this.tzUtil.fromUTC(b.bookingDate),
            start: await this.tzUtil.fromUTC(b.start),
            end: await this.tzUtil.fromUTC(b.end),
        })));
    }
    async findAllByPriest(priestId) {
        const list = await this.prisma.booking.findMany({
            where: { priestId },
            orderBy: { createdAt: 'desc' },
        });
        return Promise.all(list.map(async (b) => ({
            ...b,
            bookingDate: await this.tzUtil.fromUTC(b.bookingDate),
            start: await this.tzUtil.fromUTC(b.start),
            end: await this.tzUtil.fromUTC(b.end),
        })));
    }
    async findOne(id) {
        const b = await this.prisma.booking.findUnique({
            where: { id },
            include: {
                user: {
                    select: {
                        id: true,
                        email: true, // ✅ only valid field
                    },
                },
                pooja: true,
                priest: true,
            },
        });
        if (!b)
            return null;
        return {
            ...b,
            bookingDate: await this.tzUtil.fromUTC(b.bookingDate),
            start: await this.tzUtil.fromUTC(b.start),
            end: await this.tzUtil.fromUTC(b.end),
        };
    }
    async update(id, dto) {
        const existing = await this.prisma.booking.findUnique({ where: { id } });
        if (!existing)
            throw new common_1.NotFoundException('Booking not found');
        const data = {};
        if (dto.status !== undefined)
            data.status = dto.status;
        if (dto.bookingDate)
            data.bookingDate = await this.tzUtil.toUTC(dto.bookingDate);
        if (dto.start)
            data.start = await this.tzUtil.toUTC(dto.start);
        if (dto.end)
            data.end = await this.tzUtil.toUTC(dto.end);
        const updated = await this.prisma.booking.update({
            where: { id },
            data,
        });
        await this.notifications.sendBookingUpdated(updated.id);
        return {
            ...updated,
            bookingDate: await this.tzUtil.fromUTC(updated.bookingDate),
            start: await this.tzUtil.fromUTC(updated.start),
            end: await this.tzUtil.fromUTC(updated.end),
        };
    }
    async remove(id) {
        const existing = await this.prisma.booking.findUnique({ where: { id } });
        if (!existing)
            throw new common_1.NotFoundException('Booking not found');
        await this.notifications.sendBookingCanceled(existing.id);
        await this.prisma.booking.delete({ where: { id } });
        return { success: true };
    }
};
exports.BookingService = BookingService;
exports.BookingService = BookingService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        notifications_service_1.NotificationsService,
        coupons_service_1.CouponsService,
        distance_service_1.DistanceService])
], BookingService);
//# sourceMappingURL=booking.service.js.map
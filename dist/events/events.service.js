"use strict";
// src/events/events.service.ts
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var EventsService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.EventsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma.service");
const notifications_service_1 = require("../notifications/notifications.service");
const coupons_service_1 = require("../coupons/coupons.service");
const validate_coupon_dto_1 = require("../coupons/dto/validate-coupon.dto");
const client_1 = require("@prisma/client");
const luxon_1 = require("luxon");
const timezone_util_1 = require("../common/timezone.util");
const event_recurrence_util_1 = require("./event-recurrence.util");
let EventsService = EventsService_1 = class EventsService {
    constructor(prisma, notifications, coupons) {
        this.prisma = prisma;
        this.notifications = notifications;
        this.coupons = coupons;
        this.logger = new common_1.Logger(EventsService_1.name);
        this.tzUtil = new timezone_util_1.TimezoneUtil(this.prisma);
    }
    /* ───────────────────────── Helpers ───────────────────────── */
    async ensureEventExists(id) {
        const ev = await this.prisma.event.findUnique({ where: { id } });
        if (!ev)
            throw new common_1.NotFoundException(`Event ${id} not found`);
        return ev;
    }
    async buildStartEndUTC(params) {
        const { occurrenceLocalDay, startTimeIso, endTimeIso } = params;
        const occDayISO = luxon_1.DateTime.fromJSDate(occurrenceLocalDay).toISODate();
        const getClock = (fallback, iso) => {
            if (!iso)
                return fallback;
            const dt = luxon_1.DateTime.fromISO(iso);
            if (!dt.isValid)
                throw new common_1.BadRequestException('Invalid time format');
            return dt.toFormat('HH:mm:ss');
        };
        const startClock = getClock('00:00:00', startTimeIso);
        const endClock = getClock('23:59:59', endTimeIso);
        const startAt = await this.tzUtil.toUTC(`${occDayISO}T${startClock}`);
        const endAt = await this.tzUtil.toUTC(`${occDayISO}T${endClock}`);
        return { startAt, endAt };
    }
    async createOccurrencesForEvent(params) {
        const { eventId, recurrenceType, recurrenceDays, startDateIso, endDateIso, startTimeIso, endTimeIso, } = params;
        if (recurrenceType === client_1.EventRecurrenceType.CUSTOM &&
            (!recurrenceDays || !recurrenceDays.length)) {
            throw new common_1.BadRequestException('recurrenceDays required for CUSTOM recurrence');
        }
        const startUTC = await this.tzUtil.toUTC(startDateIso);
        const endUTC = endDateIso ? await this.tzUtil.toUTC(endDateIso) : undefined;
        const days = (0, event_recurrence_util_1.generateOccurrences)({
            recurrenceType,
            recurrenceDays,
            startDate: startUTC,
            endDate: endUTC,
        });
        if (!days.length) {
            throw new common_1.BadRequestException('No occurrences generated');
        }
        const occurrences = [];
        for (const day of days) {
            const { startAt, endAt } = await this.buildStartEndUTC({
                occurrenceLocalDay: day,
                startTimeIso,
                endTimeIso,
            });
            const dateISO = luxon_1.DateTime.fromJSDate(day).toISODate();
            const occurrenceDate = await this.tzUtil.toUTC(`${dateISO}T00:00:00`);
            occurrences.push({
                eventId,
                occurrenceDate,
                startAt,
                endAt,
                capacity: params.capacity ?? 0,
                bookedCount: 0,
            });
        }
        await this.prisma.eventOccurrence.createMany({
            data: occurrences,
            skipDuplicates: true,
        });
    }
    /* ───────────────────────── CRUD ───────────────────────── */
    async create(dto) {
        const inVenue = !!dto.venueId;
        const recurrenceType = dto.recurrenceType ?? client_1.EventRecurrenceType.NONE;
        const event = await this.prisma.event.create({
            data: {
                name: dto.name,
                description: dto.description ?? null,
                venue: !inVenue ? dto.venue ?? null : null,
                mapLink: !inVenue ? dto.mapLink ?? null : null,
                venueRel: inVenue ? { connect: { id: dto.venueId } } : undefined,
                isInVenue: inVenue,
                isOutsideVenue: !inVenue,
                recurrenceType,
                recurrenceDays: dto.recurrenceDays ?? undefined,
                date: await this.tzUtil.toUTC(dto.date),
                endDate: dto.endDate ? await this.tzUtil.toUTC(dto.endDate) : null,
                startTime: dto.startTime ? await this.tzUtil.toUTC(dto.startTime) : null,
                endTime: dto.endTime ? await this.tzUtil.toUTC(dto.endTime) : null,
                tags: dto.tags ?? undefined,
                capacity: dto.capacity ?? null,
                price: dto.price ?? null,
                organizer: dto.organizer ?? null,
                contactInfo: dto.contactInfo ?? null,
                isPublic: dto.isPublic ?? true,
                ...(dto.featuredMediaId && !dto.clearFeaturedMedia
                    ? { featuredMedia: { connect: { id: dto.featuredMediaId } } }
                    : {}),
            },
        });
        await this.createOccurrencesForEvent({
            eventId: event.id,
            recurrenceType,
            recurrenceDays: dto.recurrenceDays,
            startDateIso: dto.recurrenceStart ?? dto.date,
            endDateIso: dto.recurrenceEnd,
            startTimeIso: dto.startTime,
            endTimeIso: dto.endTime,
            capacity: dto.capacity ?? 0,
        });
        return this.findOne(event.id);
    }
    findAll() {
        return this.prisma.event.findMany({
            orderBy: { date: 'asc' },
            include: {
                featuredMedia: true,
                venueRel: true,
                occurrences: {
                    where: { isCancelled: false },
                    orderBy: { occurrenceDate: 'asc' },
                },
            },
        });
    }
    async findOne(id) {
        await this.ensureEventExists(id);
        return this.prisma.event.findUnique({
            where: { id },
            include: {
                featuredMedia: true,
                venueRel: true,
                gallery: {
                    include: { media: true },
                    orderBy: { sortOrder: 'asc' },
                },
                occurrences: {
                    where: { isCancelled: false },
                    orderBy: { occurrenceDate: 'asc' },
                },
            },
        });
    }
    async update(id, dto) {
        await this.ensureEventExists(id);
        // 1️⃣ Fetch existing event FIRST
        const existing = await this.prisma.event.findUnique({
            where: { id },
        });
        if (!existing) {
            throw new common_1.NotFoundException('Event not found');
        }
        const data = {};
        // ───────── Basic fields ─────────
        if (dto.name !== undefined)
            data.name = dto.name;
        if (dto.description !== undefined)
            data.description = dto.description;
        if (dto.tags !== undefined)
            data.tags = dto.tags;
        if (dto.capacity !== undefined)
            data.capacity = dto.capacity;
        if (dto.price !== undefined)
            data.price = dto.price;
        if (dto.organizer !== undefined)
            data.organizer = dto.organizer;
        if (dto.contactInfo !== undefined)
            data.contactInfo = dto.contactInfo;
        if (dto.isPublic !== undefined)
            data.isPublic = dto.isPublic;
        // ───────── Dates / times ─────────
        if (dto.date !== undefined)
            data.date = await this.tzUtil.toUTC(dto.date);
        if (dto.endDate !== undefined)
            data.endDate = dto.endDate
                ? await this.tzUtil.toUTC(dto.endDate)
                : null;
        if (dto.startTime !== undefined)
            data.startTime = dto.startTime
                ? await this.tzUtil.toUTC(dto.startTime)
                : null;
        if (dto.endTime !== undefined)
            data.endTime = dto.endTime
                ? await this.tzUtil.toUTC(dto.endTime)
                : null;
        // ───────── Venue ─────────
        if (dto.venueId !== undefined) {
            data.venueRel = dto.venueId
                ? { connect: { id: dto.venueId } }
                : { disconnect: true };
            data.isInVenue = !!dto.venueId;
            data.isOutsideVenue = !dto.venueId;
        }
        // ───────── Recurrence (CRITICAL) ─────────
        if (dto.recurrenceType !== undefined) {
            data.recurrenceType = dto.recurrenceType;
        }
        if (dto.recurrenceDays !== undefined) {
            data.recurrenceDays =
                dto.recurrenceType === client_1.EventRecurrenceType.CUSTOM
                    ? dto.recurrenceDays ?? []
                    : [];
        }
        // ───────── Media ─────────
        if (dto.clearFeaturedMedia) {
            data.featuredMedia = { disconnect: true };
        }
        else if (typeof dto.featuredMediaId === 'number') {
            data.featuredMedia = { connect: { id: dto.featuredMediaId } };
        }
        // 2️⃣ Update event row
        await this.prisma.event.update({
            where: { id },
            data,
        });
        // 3️⃣ Decide if recurrence needs rebuild
        const recurrenceChanged = dto.recurrenceType !== undefined ||
            dto.recurrenceDays !== undefined ||
            dto.date !== undefined ||
            dto.endDate !== undefined ||
            dto.startTime !== undefined ||
            dto.endTime !== undefined;
        // 4️⃣ Rebuild occurrences IF needed
        if (recurrenceChanged) {
            await this.prisma.eventOccurrence.deleteMany({
                where: { eventId: id },
            });
            await this.createOccurrencesForEvent({
                eventId: id,
                recurrenceType: dto.recurrenceType ?? existing.recurrenceType,
                recurrenceDays: dto.recurrenceDays ?? existing.recurrenceDays,
                startDateIso: dto.recurrenceStart ?? dto.date ?? existing.date.toISOString(),
                endDateIso: dto.recurrenceEnd ?? dto.endDate ?? existing.endDate?.toISOString(),
                startTimeIso: dto.startTime ?? existing.startTime?.toISOString(),
                endTimeIso: dto.endTime ?? existing.endTime?.toISOString(),
                capacity: dto.capacity ?? existing.capacity ?? 0,
            });
        }
        // 5️⃣ ALWAYS return full hydrated event
        return this.findOne(id);
    }
    async remove(id) {
        await this.ensureEventExists(id);
        await this.prisma.eventSponsorship.updateMany({
            where: { eventId: id },
            data: { eventId: null },
        });
        await this.prisma.eventMedia.deleteMany({ where: { eventId: id } });
        return this.prisma.event.delete({ where: { id } });
    }
    /* ───────────────────── Bookings ───────────────────── */
    // async bookOccurrenceAsGuest(occurrenceId: number, dto: BookEventDto) {
    //   // 🔒 1️⃣ TRANSACTION — DB ONLY
    //   const booking = await this.prisma.$transaction(async (tx) => {
    //     // Lock occurrence
    //     const occ = await tx.eventOccurrence.findUnique({
    //       where: { id: occurrenceId },
    //       include: { event: true },
    //     })
    //     if (!occ || occ.isCancelled) {
    //       throw new BadRequestException('Event occurrence not available')
    //     }
    //     const now = new Date()
    //     if (now >= occ.startAt) {
    //       throw new BadRequestException('Booking is closed for this event')
    //     }
    //     const pax = Math.max(1, dto.pax)
    //     // Capacity check
    //     if (occ.capacity !== null) {
    //       const remaining = occ.capacity - occ.bookedCount
    //       if (remaining <= 0) {
    //         throw new BadRequestException('Event is fully booked')
    //       }
    //       if (pax > remaining) {
    //         throw new BadRequestException(
    //           `Only ${remaining} seat(s) remaining`,
    //         )
    //       }
    //     }
    //     // Pricing
    //     const unit = occ.priceOverride ?? occ.event.price ?? 0
    //     const subtotal = pax * unit
    //     let discount = 0
    //     let total = subtotal
    //     const code = dto.couponCode?.trim()
    //     if (code) {
    //       const quote = await this.coupons.validateAndQuote(code, {
    //         kind: ValidateKind.EVENT,
    //         eventId: occ.eventId,
    //         pax,
    //       })
    //       if (!quote.valid) {
    //         throw new BadRequestException(quote.reason)
    //       }
    //       discount = quote.discount ?? 0
    //       total = quote.total ?? subtotal - discount
    //     }
    //     // Create booking
    //     const booking = await tx.eventBooking.create({
    //       data: {
    //         eventOccurrenceId: occ.id,
    //         eventNameAtBooking: occ.event.name,
    //         eventDateAtBooking: occ.occurrenceDate,
    //         pax,
    //         subtotal,
    //         discountAmount: discount,
    //         total,
    //         userName: dto.userName ?? null,
    //         userEmail: dto.userEmail ?? null,
    //         userPhone: dto.userPhone ?? null,
    //         couponCode: code ?? null,
    //       },
    //     })
    //     // Increment seats
    //     await tx.eventOccurrence.update({
    //       where: { id: occ.id },
    //       data: {
    //         bookedCount: { increment: pax },
    //       },
    //     })
    //     // Record coupon redemption
    //     if (code && discount > 0) {
    //       await this.coupons.recordRedemption(
    //         {
    //           couponCode: code,
    //           amountApplied: discount,
    //           userId: null,
    //           target: {
    //             type: 'event',
    //             eventBookingId: booking.id,
    //           },
    //         },
    //         tx,
    //       )
    //     }
    //     return booking
    //   })
    //   // 📧 2️⃣ SIDE EFFECTS — OUTSIDE TRANSACTION
    //   await this.notifications.sendEventBookingCreated(booking.id)
    //   return booking
    // }
    async bookOccurrenceAsGuest(occurrenceId, dto) {
        const booking = await this.prisma.$transaction(async (tx) => {
            const occ = await tx.eventOccurrence.findUnique({
                where: { id: occurrenceId },
                include: { event: true },
            });
            if (!occ || occ.isCancelled) {
                throw new common_1.BadRequestException('Event occurrence not available');
            }
            const now = new Date();
            if (now >= occ.startAt) {
                throw new common_1.BadRequestException('Booking is closed for this event');
            }
            const pax = Math.max(1, dto.pax);
            // Capacity check (SOFT CHECK)
            if (occ.capacity !== null) {
                const remaining = occ.capacity - occ.bookedCount;
                if (remaining <= 0) {
                    throw new common_1.BadRequestException('Event is fully booked');
                }
                if (pax > remaining) {
                    throw new common_1.BadRequestException(`Only ${remaining} seat(s) remaining`);
                }
            }
            const unit = occ.priceOverride ?? occ.event.price ?? 0;
            const subtotal = pax * unit;
            let discount = 0;
            let total = subtotal;
            const code = dto.couponCode?.trim();
            if (code) {
                const quote = await this.coupons.validateAndQuote(code, {
                    kind: validate_coupon_dto_1.ValidateKind.EVENT,
                    eventId: occ.eventId,
                    pax,
                });
                if (!quote.valid) {
                    throw new common_1.BadRequestException(quote.reason);
                }
                discount = quote.discount ?? 0;
                total = quote.total ?? subtotal - discount;
            }
            // ✅ Create booking as PENDING
            const booking = await tx.eventBooking.create({
                data: {
                    eventOccurrenceId: occ.id,
                    eventNameAtBooking: occ.event.name,
                    eventDateAtBooking: occ.occurrenceDate,
                    pax,
                    subtotal,
                    discountAmount: discount,
                    total,
                    status: 'PENDING',
                    userName: dto.userName ?? null,
                    userEmail: dto.userEmail ?? null,
                    userPhone: dto.userPhone ?? null,
                    couponCode: code ?? null,
                },
            });
            return booking;
        });
        // ❌ No seat increment here
        // ❌ No coupon redemption here
        // ❌ No confirmation notification here
        return booking;
    }
    async findBookings(eventId) {
        return this.prisma.eventBooking.findMany({
            where: {
                eventOccurrence: {
                    eventId,
                },
            },
            include: {
                payment: true, // ✅ THIS IS WHERE IT BELONGS
            },
            orderBy: { bookedAt: 'desc' },
        });
    }
    /* ───────────────────── Media helpers ───────────────────── */
    async setFeaturedMedia(eventId, mediaId) {
        await this.ensureEventExists(eventId);
        if (mediaId != null) {
            const exists = await this.prisma.mediaAsset.count({ where: { id: mediaId } });
            if (!exists)
                throw new common_1.BadRequestException('mediaId not found');
        }
        return this.prisma.event.update({
            where: { id: eventId },
            data: { featuredMediaId: mediaId },
            include: {
                featuredMedia: true,
                gallery: { include: { media: true }, orderBy: { sortOrder: 'asc' } },
            },
        });
    }
    async addToGallery(eventId, mediaIds) {
        await this.ensureEventExists(eventId);
        if (!mediaIds?.length)
            return { ok: true };
        const ids = [...new Set(mediaIds)];
        const count = await this.prisma.mediaAsset.count({ where: { id: { in: ids } } });
        if (count !== ids.length)
            throw new common_1.BadRequestException('Invalid mediaIds');
        const max = await this.prisma.eventMedia.aggregate({
            where: { eventId },
            _max: { sortOrder: true },
        });
        let start = (max._max.sortOrder ?? -1) + 1;
        await this.prisma.eventMedia.createMany({
            data: ids.map((mid) => ({ eventId, mediaId: mid, sortOrder: start++ })),
            skipDuplicates: true,
        });
        return this.findOne(eventId);
    }
    async reorderGallery(eventId, orders) {
        await this.ensureEventExists(eventId);
        await this.prisma.eventMedia.deleteMany({ where: { eventId } });
        const data = orders
            .sort((a, b) => a.sortOrder - b.sortOrder)
            .map((o, i) => ({ eventId, mediaId: o.mediaId, sortOrder: i }));
        if (data.length) {
            await this.prisma.eventMedia.createMany({ data });
        }
        return { ok: true };
    }
    async removeFromGallery(eventId, mediaId) {
        await this.ensureEventExists(eventId);
        await this.prisma.eventMedia.deleteMany({ where: { eventId, mediaId } });
        return { ok: true };
    }
};
exports.EventsService = EventsService;
exports.EventsService = EventsService = EventsService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        notifications_service_1.NotificationsService,
        coupons_service_1.CouponsService])
], EventsService);
//# sourceMappingURL=events.service.js.map
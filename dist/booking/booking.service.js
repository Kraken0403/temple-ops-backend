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
let BookingService = class BookingService {
    constructor(prisma, notifications) {
        this.prisma = prisma;
        this.notifications = notifications;
        this.tzUtil = new timezone_util_1.TimezoneUtil(prisma);
    }
    // ✅ Create a booking (snapshot immutable facts)
    // ✅ Create
    async create(dto) {
        const bookingDate = await this.tzUtil.toUTC(dto.bookingDate);
        const start = await this.tzUtil.toUTC(dto.start);
        const end = await this.tzUtil.toUTC(dto.end);
        const pooja = await this.prisma.pooja.findUnique({
            where: { id: dto.poojaId },
            include: { priests: true },
        });
        if (!pooja)
            throw new common_1.BadRequestException('Pooja not found');
        if (pooja.deletedAt)
            throw new common_1.BadRequestException('This pooja is no longer available');
        const priest = await this.prisma.priest.findUnique({ where: { id: dto.priestId } });
        if (!priest)
            throw new common_1.BadRequestException('Priest not found');
        const isAssignedPriest = pooja.priests.some(p => p.id === dto.priestId);
        if (!isAssignedPriest)
            throw new common_1.BadRequestException('This priest is not assigned to the selected pooja');
        const created = await this.prisma.booking.create({
            data: {
                userId: dto.userId ?? undefined,
                poojaId: dto.poojaId,
                priestId: dto.priestId,
                bookingDate,
                start,
                end,
                // snapshots
                amountAtBooking: pooja.amount,
                poojaNameAtBooking: pooja.name,
                priestNameAtBooking: priest.name ?? null,
                // optional fields
                userName: dto.userName ?? undefined,
                userEmail: dto.userEmail ?? undefined,
                userPhone: dto.userPhone ?? undefined,
                venueAddress: dto.venueAddress ?? undefined,
                venueState: dto.venueState ?? undefined,
                venueZip: dto.venueZip ?? undefined,
            },
            include: {
                pooja: { select: { id: true, name: true } },
                priest: { select: { id: true, name: true } },
            },
        });
        await this.notifications.sendBookingCreated(created.id);
        return {
            ...created,
            bookingDate: await this.tzUtil.fromUTC(created.bookingDate),
            start: await this.tzUtil.fromUTC(created.start),
            end: await this.tzUtil.fromUTC(created.end),
        };
    }
    // ✅ Find all
    async findAll() {
        const list = await this.prisma.booking.findMany({
            orderBy: { createdAt: 'desc' },
            include: {
                pooja: { select: { id: true, name: true } },
                priest: { select: { id: true, name: true } },
            },
        });
        return Promise.all(list.map(async (b) => ({
            ...b,
            bookingDate: await this.tzUtil.fromUTC(b.bookingDate),
            start: await this.tzUtil.fromUTC(b.start),
            end: await this.tzUtil.fromUTC(b.end),
        })));
    }
    // ✅ Find one
    async findOne(id) {
        const b = await this.prisma.booking.findUnique({
            where: { id },
            include: {
                pooja: { select: { id: true, name: true } },
                priest: { select: { id: true, name: true } },
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
    // ✅ Update
    async update(id, dto) {
        const existing = await this.prisma.booking.findUnique({
            where: { id },
            include: { pooja: { include: { priests: true } }, priest: true },
        });
        if (!existing)
            throw new common_1.NotFoundException('Booking not found');
        const data = {};
        let newPoojaId = existing.poojaId;
        let newPriestId = existing.priestId;
        // potential pooja change
        if (dto.poojaId !== undefined) {
            const pooja = await this.prisma.pooja.findUnique({
                where: { id: dto.poojaId },
                include: { priests: true },
            });
            if (!pooja)
                throw new common_1.BadRequestException('Pooja not found');
            data.poojaId = dto.poojaId;
            newPoojaId = dto.poojaId;
        }
        // potential priest change
        if (dto.priestId !== undefined) {
            const priest = await this.prisma.priest.findUnique({ where: { id: dto.priestId } });
            if (!priest)
                throw new common_1.BadRequestException('Priest not found');
            data.priestId = dto.priestId;
            newPriestId = dto.priestId;
        }
        // validate pair if changed
        if (dto.poojaId !== undefined || dto.priestId !== undefined) {
            const poojaForCheck = await this.prisma.pooja.findUnique({
                where: { id: newPoojaId },
                include: { priests: { select: { id: true } } },
            });
            const isAssigned = poojaForCheck?.priests?.some(p => p.id === newPriestId);
            if (!isAssigned) {
                throw new common_1.BadRequestException(`Priest ${newPriestId} is not assigned to pooja ${newPoojaId}`);
            }
            const newPooja = await this.prisma.pooja.findUnique({ where: { id: newPoojaId } });
            const newPriest = await this.prisma.priest.findUnique({ where: { id: newPriestId } });
            data.amountAtBooking = newPooja?.amount;
            data.poojaNameAtBooking = newPooja?.name ?? existing.poojaNameAtBooking;
            data.priestNameAtBooking = newPriest?.name ?? existing.priestNameAtBooking;
        }
        // timezone-aware updates
        if (dto.bookingDate !== undefined)
            data.bookingDate = await this.tzUtil.toUTC(dto.bookingDate);
        if (dto.start !== undefined)
            data.start = await this.tzUtil.toUTC(dto.start);
        if (dto.end !== undefined)
            data.end = await this.tzUtil.toUTC(dto.end);
        // standard fields
        if (dto.userId !== undefined)
            data.userId = dto.userId;
        if (dto.userName !== undefined)
            data.userName = dto.userName;
        if (dto.userEmail !== undefined)
            data.userEmail = dto.userEmail;
        if (dto.userPhone !== undefined)
            data.userPhone = dto.userPhone;
        if (dto.venueAddress !== undefined)
            data.venueAddress = dto.venueAddress;
        if (dto.venueState !== undefined)
            data.venueState = dto.venueState;
        if (dto.venueZip !== undefined)
            data.venueZip = dto.venueZip;
        if (dto.status !== undefined)
            data.status = dto.status;
        const updated = await this.prisma.booking.update({
            where: { id },
            data,
            include: {
                pooja: { select: { id: true, name: true } },
                priest: { select: { id: true, name: true } },
            },
        });
        await this.notifications.sendBookingUpdated(updated.id);
        return {
            ...updated,
            bookingDate: await this.tzUtil.fromUTC(updated.bookingDate),
            start: await this.tzUtil.fromUTC(updated.start),
            end: await this.tzUtil.fromUTC(updated.end),
        };
    }
    // ✅ Delete (hard-delete). Consider soft-cancel in future.
    async remove(id) {
        const existing = await this.prisma.booking.findUnique({ where: { id } });
        if (!existing)
            throw new common_1.NotFoundException('Booking not found');
        await this.notifications.sendBookingCanceled(existing.id);
        try {
            await this.prisma.booking.delete({ where: { id } });
            return { success: true };
        }
        catch (e) {
            if (e?.code === 'P2025')
                throw new common_1.NotFoundException('Booking not found');
            throw e;
        }
    }
};
exports.BookingService = BookingService;
exports.BookingService = BookingService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        notifications_service_1.NotificationsService])
], BookingService);
//# sourceMappingURL=booking.service.js.map
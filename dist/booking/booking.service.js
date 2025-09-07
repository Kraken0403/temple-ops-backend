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
let BookingService = class BookingService {
    constructor(prisma, notifications) {
        this.prisma = prisma;
        this.notifications = notifications;
    }
    // ✅ Create a booking (snapshot immutable facts)
    async create(dto) {
        const pooja = await this.prisma.pooja.findUnique({
            where: { id: dto.poojaId },
            include: { priests: true },
        });
        if (!pooja)
            throw new common_1.BadRequestException('Pooja not found');
        if (pooja.deletedAt) {
            throw new common_1.BadRequestException('This pooja is no longer available');
        }
        const priest = await this.prisma.priest.findUnique({
            where: { id: dto.priestId },
        });
        if (!priest)
            throw new common_1.BadRequestException('Priest not found');
        const isAssignedPriest = pooja.priests.some(p => p.id === dto.priestId);
        if (!isAssignedPriest) {
            throw new common_1.BadRequestException('This priest is not assigned to the selected pooja');
        }
        const created = await this.prisma.booking.create({
            data: {
                userId: dto.userId ?? undefined,
                poojaId: dto.poojaId,
                priestId: dto.priestId,
                bookingDate: new Date(dto.bookingDate),
                start: new Date(dto.start),
                end: new Date(dto.end),
                // 🔒 snapshots (do not depend on live pooja/priest later)
                amountAtBooking: pooja.amount,
                poojaNameAtBooking: pooja.name,
                priestNameAtBooking: priest.name ?? null,
                // optional user/venue fields
                userName: dto.userName ?? undefined,
                userEmail: dto.userEmail ?? undefined,
                userPhone: dto.userPhone ?? undefined,
                venueAddress: dto.venueAddress ?? undefined,
                venueState: dto.venueState ?? undefined,
                venueZip: dto.venueZip ?? undefined,
            },
            include: {
                pooja: { select: { id: true, name: true } }, // sanitized
                priest: { select: { id: true, name: true } },
            },
        });
        // 🔔 Fire-and-forget email (service handles/logs failures)
        await this.notifications.sendBookingCreated(created.id);
        return created;
    }
    // ✅ List (sanitized relations to avoid leaking live price)
    async findAll() {
        return this.prisma.booking.findMany({
            orderBy: { createdAt: 'desc' },
            include: {
                pooja: { select: { id: true, name: true } },
                priest: { select: { id: true, name: true } },
            },
        });
    }
    // ✅ Get single (sanitized)
    async findOne(id) {
        return this.prisma.booking.findUnique({
            where: { id },
            include: {
                pooja: { select: { id: true, name: true } },
                priest: { select: { id: true, name: true } },
            },
        });
    }
    // ✅ Update; refresh snapshots only when pooja/priest changes; notify on success
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
        // Handle potential pooja change
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
        // Handle potential priest change
        if (dto.priestId !== undefined) {
            const priest = await this.prisma.priest.findUnique({ where: { id: dto.priestId } });
            if (!priest)
                throw new common_1.BadRequestException('Priest not found');
            data.priestId = dto.priestId;
            newPriestId = dto.priestId;
        }
        // If either changed, validate new pairing and refresh snapshots
        if (dto.poojaId !== undefined || dto.priestId !== undefined) {
            const poojaForCheck = await this.prisma.pooja.findUnique({
                where: { id: newPoojaId },
                include: { priests: { select: { id: true } } },
            });
            const isAssigned = poojaForCheck?.priests?.some(p => p.id === newPriestId);
            if (!isAssigned) {
                throw new common_1.BadRequestException('This priest is not assigned to the selected pooja');
            }
            const newPooja = await this.prisma.pooja.findUnique({ where: { id: newPoojaId } });
            const newPriest = await this.prisma.priest.findUnique({ where: { id: newPriestId } });
            data.amountAtBooking = newPooja?.amount;
            data.poojaNameAtBooking = newPooja?.name ?? existing.poojaNameAtBooking;
            data.priestNameAtBooking = newPriest?.name ?? existing.priestNameAtBooking;
        }
        // Standard field updates
        if (dto.bookingDate !== undefined)
            data.bookingDate = new Date(dto.bookingDate);
        if (dto.start !== undefined)
            data.start = new Date(dto.start);
        if (dto.end !== undefined)
            data.end = new Date(dto.end);
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
                pooja: { select: { id: true, name: true } }, // sanitized
                priest: { select: { id: true, name: true } },
            },
        });
        // 🔔 Notify on update
        await this.notifications.sendBookingUpdated(updated.id);
        return updated;
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
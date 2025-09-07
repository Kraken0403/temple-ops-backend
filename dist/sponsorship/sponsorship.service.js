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
exports.SponsorshipService = void 0;
// src/sponsorship/sponsorship.service.ts
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma.service");
let SponsorshipService = class SponsorshipService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    // 1. Create a sponsorship type
    async createType(dto) {
        return this.prisma.sponsorshipType.create({
            data: {
                name: dto.name,
                description: dto.description,
                price: dto.price,
            },
        });
    }
    // 1b. Update a sponsorship type
    async updateType(id, dto) {
        const existing = await this.prisma.sponsorshipType.findUnique({ where: { id } });
        if (!existing)
            throw new common_1.NotFoundException('Sponsorship type not found');
        return this.prisma.sponsorshipType.update({
            where: { id },
            data: {
                ...(dto.name !== undefined && { name: dto.name }),
                ...(dto.description !== undefined && { description: dto.description }),
                ...(dto.price !== undefined && { price: dto.price }),
            },
        });
    }
    // 2. Assign sponsorship type to an event
    async assignToEvent(dto) {
        const { eventId, sponsorshipTypeId, maxSlots, price } = dto;
        const sponsorshipType = await this.prisma.sponsorshipType.findUnique({
            where: { id: sponsorshipTypeId },
        });
        if (!sponsorshipType) {
            throw new common_1.NotFoundException(`Sponsorship type with ID ${sponsorshipTypeId} not found`);
        }
        const finalPrice = price ?? sponsorshipType.price;
        return this.prisma.eventSponsorship.upsert({
            where: {
                eventId_sponsorshipTypeId: { eventId, sponsorshipTypeId },
            },
            update: { maxSlots, price: finalPrice },
            create: { eventId, sponsorshipTypeId, maxSlots, price: finalPrice },
        });
    }
    // 2b. Update an event sponsorship (by id)
    async updateEventSponsorship(id, dto) {
        const existing = await this.prisma.eventSponsorship.findUnique({ where: { id } });
        if (!existing)
            throw new common_1.NotFoundException('Event sponsorship not found');
        // NOTE: We do not allow changing eventId/sponsorshipTypeId here.
        // If you need to "switch type", delete & re-assign with assignToEvent().
        return this.prisma.eventSponsorship.update({
            where: { id },
            data: {
                ...(dto.maxSlots !== undefined && { maxSlots: dto.maxSlots }),
                ...(dto.price !== undefined && { price: dto.price }),
            },
            include: {
                event: true,
                sponsorshipType: true,
                bookings: true,
            },
        });
    }
    async getAllBookings() {
        return this.prisma.sponsorshipBooking.findMany({
            orderBy: { bookedAt: 'desc' },
            include: {
                eventSponsorship: {
                    include: { sponsorshipType: true, event: true },
                },
            },
        });
    }
    // 3b. Update booking (optional)
    async updateBooking(id, dto) {
        const existing = await this.prisma.sponsorshipBooking.findUnique({ where: { id } });
        if (!existing)
            throw new common_1.NotFoundException('Booking not found');
        return this.prisma.sponsorshipBooking.update({
            where: { id },
            data: {
                ...(dto.sponsorName !== undefined && { sponsorName: dto.sponsorName }),
                ...(dto.sponsorEmail !== undefined && { sponsorEmail: dto.sponsorEmail }),
                ...(dto.sponsorPhone !== undefined && { sponsorPhone: dto.sponsorPhone }),
            },
            include: {
                eventSponsorship: {
                    include: { sponsorshipType: true, event: true },
                },
            },
        });
    }
    async getEventSponsorshipById(id) {
        return this.prisma.eventSponsorship.findUnique({
            where: { id },
            include: { event: true, sponsorshipType: true, bookings: true },
        });
    }
    async getAllEventSponsorships() {
        return this.prisma.eventSponsorship.findMany({
            include: {
                sponsorshipType: true,
                event: true,
                bookings: true,
            },
            orderBy: { id: 'desc' },
        });
    }
    // 3. Book a sponsorship slot (for a specific event sponsorship)
    async book(dto, userId) {
        const { eventSponsorshipId } = dto;
        const sponsorship = await this.prisma.eventSponsorship.findUnique({
            where: { id: eventSponsorshipId },
            include: { bookings: true },
        });
        if (!sponsorship)
            throw new common_1.NotFoundException('Event sponsorship not found');
        if (sponsorship.bookings.length >= sponsorship.maxSlots) {
            throw new common_1.BadRequestException('Sponsorship slots are full');
        }
        return this.prisma.sponsorshipBooking.create({
            data: {
                eventSponsorshipId,
                userId: userId ?? null,
                sponsorName: dto.sponsorName,
                sponsorEmail: dto.sponsorEmail,
                sponsorPhone: dto.sponsorPhone,
            },
        });
    }
    // 4. Get all sponsorships for an event
    async getSponsorshipsForEvent(eventId) {
        return this.prisma.eventSponsorship.findMany({
            where: { eventId },
            include: { sponsorshipType: true, bookings: true },
        });
    }
    async removeSponsorshipAssignment(eventId, sponsorshipTypeId) {
        const existing = await this.prisma.eventSponsorship.findUnique({
            where: { eventId_sponsorshipTypeId: { eventId, sponsorshipTypeId } },
        });
        if (!existing)
            throw new common_1.NotFoundException('Sponsorship assignment not found');
        return this.prisma.eventSponsorship.delete({
            where: { eventId_sponsorshipTypeId: { eventId, sponsorshipTypeId } },
        });
    }
    async getAllTypes() {
        return this.prisma.sponsorshipType.findMany({
            orderBy: { createdAt: 'desc' },
            select: {
                id: true,
                name: true,
                description: true,
                price: true,
                createdAt: true,
                _count: { select: { eventSponsorships: true } },
            },
        });
    }
    /** TYPE DELETE — safe: block if still linked anywhere */
    async deleteTypeSafe(id) {
        const type = await this.prisma.sponsorshipType.findUnique({
            where: { id },
            include: { eventSponsorships: true },
        });
        if (!type)
            throw new common_1.NotFoundException('Sponsorship type not found');
        if (type.eventSponsorships.length > 0) {
            throw new common_1.BadRequestException('Cannot delete: sponsorship type is assigned to one or more events. Remove assignments first or use force=true.');
        }
        return this.prisma.sponsorshipType.delete({ where: { id } });
    }
    /** TYPE DELETE — force: removes eventSponsorships (and their bookings) then deletes type */
    async deleteTypeForce(id) {
        const type = await this.prisma.sponsorshipType.findUnique({
            where: { id },
            include: { eventSponsorships: true },
        });
        if (!type)
            throw new common_1.NotFoundException('Sponsorship type not found');
        // Delete bookings of all linked eventSponsorships, then delete the eventSponsorships, then the type.
        const esIds = type.eventSponsorships.map(es => es.id);
        return this.prisma.$transaction(async (tx) => {
            if (esIds.length > 0) {
                await tx.sponsorshipBooking.deleteMany({
                    where: { eventSponsorshipId: { in: esIds } },
                });
                await tx.eventSponsorship.deleteMany({
                    where: { id: { in: esIds } },
                });
            }
            return tx.sponsorshipType.delete({ where: { id } });
        });
    }
    /** EVENT SPONSORSHIP DELETE — by ID (also deletes its bookings) */
    async deleteEventSponsorshipById(id) {
        const existing = await this.prisma.eventSponsorship.findUnique({
            where: { id },
        });
        if (!existing)
            throw new common_1.NotFoundException('Event sponsorship not found');
        return this.prisma.$transaction(async (tx) => {
            await tx.sponsorshipBooking.deleteMany({ where: { eventSponsorshipId: id } });
            return tx.eventSponsorship.delete({ where: { id } });
        });
    }
    /** BOOKING DELETE — by ID */
    async deleteBooking(id) {
        const existing = await this.prisma.sponsorshipBooking.findUnique({ where: { id } });
        if (!existing)
            throw new common_1.NotFoundException('Booking not found');
        return this.prisma.sponsorshipBooking.delete({ where: { id } });
    }
};
exports.SponsorshipService = SponsorshipService;
exports.SponsorshipService = SponsorshipService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], SponsorshipService);
//# sourceMappingURL=sponsorship.service.js.map
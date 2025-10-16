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
var EventsService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.EventsService = void 0;
// src/events/events.service.ts
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma.service");
const notifications_service_1 = require("../notifications/notifications.service");
let EventsService = EventsService_1 = class EventsService {
    constructor(prisma, notifications) {
        this.prisma = prisma;
        this.notifications = notifications;
        this.logger = new common_1.Logger(EventsService_1.name);
    }
    /* ───────────────────────────── Helpers ───────────────────────────── */
    getEventWindow(ev) {
        const toYmdUTC = (d) => new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate(), 0, 0, 0, 0));
        const dateBase = ev.date ? toYmdUTC(new Date(ev.date)) : null;
        const endBase = ev.endDate ? toYmdUTC(new Date(ev.endDate)) : dateBase;
        let startAt = null;
        if (dateBase) {
            if (ev.startTime) {
                const t = new Date(ev.startTime);
                startAt = new Date(Date.UTC(dateBase.getUTCFullYear(), dateBase.getUTCMonth(), dateBase.getUTCDate(), t.getUTCHours(), t.getUTCMinutes(), t.getUTCSeconds(), t.getUTCMilliseconds()));
            }
            else
                startAt = dateBase;
        }
        let endAt = null;
        if (endBase) {
            if (ev.endTime) {
                const t = new Date(ev.endTime);
                endAt = new Date(Date.UTC(endBase.getUTCFullYear(), endBase.getUTCMonth(), endBase.getUTCDate(), t.getUTCHours(), t.getUTCMinutes(), t.getUTCSeconds(), t.getUTCMilliseconds()));
            }
            else
                endAt = endBase;
        }
        return { startAt, endAt };
    }
    isOpenForRegistration(ev, now = new Date()) {
        const { startAt } = this.getEventWindow(ev);
        if (!startAt)
            return false;
        return now < startAt;
    }
    async ensureExists(id) {
        const ev = await this.prisma.event.findUnique({ where: { id } });
        if (!ev)
            throw new common_1.NotFoundException(`Event ${id} not found`);
    }
    /* ───────────────────────────── CRUD ───────────────────────────── */
    async create(createDto) {
        this.logger.debug(`Creating event with DTO: ${JSON.stringify(createDto, null, 2)}`);
        const inVenue = !!createDto.venueId;
        const outsideVenue = !inVenue;
        const data = {
            name: createDto.name,
            description: createDto.description ?? null,
            venue: outsideVenue ? createDto.venue ?? null : null,
            mapLink: outsideVenue ? createDto.mapLink ?? null : null,
            isInVenue: inVenue,
            isOutsideVenue: outsideVenue,
            date: createDto.date ? new Date(createDto.date) : null,
            endDate: createDto.endDate ? new Date(createDto.endDate) : null,
            startTime: createDto.startTime ? new Date(createDto.startTime) : null,
            endTime: createDto.endTime ? new Date(createDto.endTime) : null,
            tags: createDto.tags ?? undefined,
            capacity: createDto.capacity ?? null,
            price: createDto.price ?? null,
            organizer: createDto.organizer ?? null,
            contactInfo: createDto.contactInfo ?? null,
            isPublic: createDto.isPublic ?? true,
        };
        if (inVenue && createDto.venueId) {
            data.venueRel = { connect: { id: createDto.venueId } };
        }
        if (!createDto.clearFeaturedMedia && typeof createDto.featuredMediaId === 'number') {
            data.featuredMedia = { connect: { id: createDto.featuredMediaId } };
        }
        return this.prisma.event.create({
            data,
            include: {
                featuredMedia: true,
                gallery: { include: { media: true }, orderBy: { sortOrder: 'asc' } },
            },
        });
    }
    findAll() {
        return this.prisma.event
            .findMany({
            orderBy: { date: 'asc' },
            include: { featuredMedia: true, venueRel: true },
        })
            .then((rows) => rows.map((ev) => ({
            ...ev,
            isOpenForRegistration: this.isOpenForRegistration(ev),
        })));
    }
    async findOne(id) {
        const ev = await this.prisma.event.findUnique({
            where: { id },
            include: {
                featuredMedia: true,
                gallery: { include: { media: true }, orderBy: { sortOrder: 'asc' } },
                venueRel: true,
            },
        });
        if (!ev)
            throw new common_1.NotFoundException(`Event ${id} not found`);
        return {
            ...ev,
            isOpenForRegistration: this.isOpenForRegistration(ev),
        };
    }
    async update(id, updateDto) {
        this.logger.debug(`Updating event ${id} with DTO: ${JSON.stringify(updateDto, null, 2)}`);
        await this.ensureExists(id);
        const inVenue = !!updateDto.venueId;
        const outsideVenue = !inVenue;
        const data = {
            ...(updateDto.name !== undefined && { name: updateDto.name }),
            ...(updateDto.description !== undefined && { description: updateDto.description }),
            venue: outsideVenue ? updateDto.venue ?? null : null,
            mapLink: outsideVenue ? updateDto.mapLink ?? null : null,
            isInVenue: inVenue,
            isOutsideVenue: outsideVenue,
            ...(updateDto.date !== undefined && {
                date: updateDto.date ? new Date(updateDto.date) : null,
            }),
            ...(updateDto.endDate !== undefined && {
                endDate: updateDto.endDate ? new Date(updateDto.endDate) : null,
            }),
            ...(updateDto.startTime !== undefined && {
                startTime: updateDto.startTime ? new Date(updateDto.startTime) : null,
            }),
            ...(updateDto.endTime !== undefined && {
                endTime: updateDto.endTime ? new Date(updateDto.endTime) : null,
            }),
            ...(updateDto.tags !== undefined && { tags: updateDto.tags }),
            ...(updateDto.capacity !== undefined && { capacity: updateDto.capacity }),
            ...(updateDto.price !== undefined && { price: updateDto.price }),
            ...(updateDto.organizer !== undefined && { organizer: updateDto.organizer }),
            ...(updateDto.contactInfo !== undefined && { contactInfo: updateDto.contactInfo }),
            ...(updateDto.isPublic !== undefined && { isPublic: updateDto.isPublic }),
        };
        // ✅ Handle venue relation safely
        if (updateDto.venueId !== undefined) {
            if (updateDto.venueId) {
                data.venueRel = { connect: { id: updateDto.venueId } };
            }
            else {
                data.venueRel = { disconnect: true };
                data.venueId = null; // Prevent FK constraint error
            }
        }
        // ✅ Handle featured image safely
        if (updateDto.clearFeaturedMedia) {
            data.featuredMedia = { disconnect: true };
        }
        else if (typeof updateDto.featuredMediaId === "number") {
            data.featuredMedia = { connect: { id: updateDto.featuredMediaId } };
        }
        try {
            const updated = await this.prisma.event.update({
                where: { id },
                data,
                include: {
                    featuredMedia: true,
                    gallery: { include: { media: true }, orderBy: { sortOrder: "asc" } },
                },
            });
            this.logger.debug(`✅ Event ${id} updated successfully`);
            return updated;
        }
        catch (err) {
            if (err instanceof Error) {
                this.logger.error(`❌ Prisma update failed for event ${id}: ${err.message}`, err.stack);
                throw new common_1.BadRequestException(err.message);
            }
            else {
                this.logger.error(`❌ Unknown error while updating event ${id}: ${String(err)}`);
                throw new common_1.BadRequestException("Failed to update event. Check server logs.");
            }
        }
    }
    async remove(id) {
        await this.ensureExists(id);
        await this.prisma.eventSponsorship.updateMany({
            where: { eventId: id },
            data: { eventId: null },
        });
        await this.prisma.eventMedia.deleteMany({ where: { eventId: id } });
        return this.prisma.event.delete({ where: { id } });
    }
    /* ─────────────────────────── Bookings ─────────────────────────── */
    async bookEventAsGuest(eventId, dto) {
        const ev = await this.prisma.event.findUnique({ where: { id: eventId } });
        if (!ev)
            throw new common_1.NotFoundException(`Event ${eventId} not found`);
        if (!this.isOpenForRegistration(ev)) {
            throw new common_1.BadRequestException('Registrations are closed for this event');
        }
        if (ev.capacity != null) {
            const aggregate = await this.prisma.eventBooking.aggregate({
                where: { eventId, status: 'confirmed' },
                _sum: { pax: true },
            });
            const already = aggregate._sum.pax ?? 0;
            if (already + dto.pax > ev.capacity) {
                throw new common_1.BadRequestException('Not enough seats available');
            }
        }
        const booking = await this.prisma.eventBooking.create({
            data: {
                event: { connect: { id: eventId } },
                pax: dto.pax,
                userName: dto.userName ?? null,
                userEmail: dto.userEmail ?? null,
                userPhone: dto.userPhone ?? null,
                status: 'confirmed',
            },
        });
        // ✅ trigger notification
        try {
            await this.notifications.sendEventBookingCreated(booking.id);
        }
        catch (err) {
            if (err instanceof Error) {
                this.logger.error(`Failed to send booking notification: ${err.message}`, err.stack);
            }
            else {
                this.logger.error(`Failed to send booking notification: ${String(err)}`);
            }
        }
        return booking;
    }
    async findBookings(eventId) {
        await this.ensureExists(eventId);
        return this.prisma.eventBooking.findMany({
            where: { eventId },
            orderBy: { bookedAt: 'desc' },
        });
    }
    /* ───────────────────── Media / Gallery helpers ─────────────────── */
    async setFeaturedMedia(eventId, mediaId) {
        await this.ensureExists(eventId);
        if (mediaId != null) {
            const exists = await this.prisma.mediaAsset.count({ where: { id: mediaId } });
            if (!exists)
                throw new common_1.BadRequestException('mediaId not found');
        }
        return this.prisma.event
            .update({
            where: { id: eventId },
            data: { featuredMediaId: mediaId },
            include: {
                featuredMedia: true,
                gallery: { include: { media: true }, orderBy: { sortOrder: 'asc' } },
            },
        })
            .then((ev) => ({
            ...ev,
            isOpenForRegistration: this.isOpenForRegistration(ev),
        }));
    }
    async addToGallery(eventId, mediaIds) {
        await this.ensureExists(eventId);
        if (!mediaIds?.length)
            return { ok: true };
        const ids = [...new Set(mediaIds)];
        const count = await this.prisma.mediaAsset.count({ where: { id: { in: ids } } });
        if (count !== ids.length)
            throw new common_1.BadRequestException('Some mediaIds do not exist');
        const max = await this.prisma.eventMedia.aggregate({
            where: { eventId },
            _max: { sortOrder: true },
        });
        let start = (max._max.sortOrder ?? -1) + 1;
        await this.prisma.eventMedia.createMany({
            data: ids.map((mid) => ({ eventId, mediaId: mid, sortOrder: start++ })),
            skipDuplicates: true,
        });
        const ev = await this.prisma.event.findUnique({
            where: { id: eventId },
            include: { gallery: { include: { media: true }, orderBy: { sortOrder: 'asc' } } },
        });
        return {
            ...ev,
            isOpenForRegistration: ev
                ? this.isOpenForRegistration(ev)
                : false,
        };
    }
    async reorderGallery(eventId, orders) {
        await this.ensureExists(eventId);
        await this.prisma.eventMedia.deleteMany({ where: { eventId } });
        const data = (orders ?? [])
            .slice()
            .sort((a, b) => a.sortOrder - b.sortOrder)
            .map((o, i) => ({ eventId, mediaId: o.mediaId, sortOrder: i }));
        if (data.length)
            await this.prisma.eventMedia.createMany({ data });
        return { ok: true };
    }
    async removeFromGallery(eventId, mediaId) {
        await this.ensureExists(eventId);
        await this.prisma.eventMedia.deleteMany({ where: { eventId, mediaId } });
        return { ok: true };
    }
};
exports.EventsService = EventsService;
exports.EventsService = EventsService = EventsService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        notifications_service_1.NotificationsService])
], EventsService);
//# sourceMappingURL=events.service.js.map
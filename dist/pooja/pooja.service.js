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
exports.PoojaService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma.service");
let PoojaService = class PoojaService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    /** List all (non-archived) poojas */
    findAll() {
        return this.prisma.pooja.findMany({
            where: { deletedAt: null },
            orderBy: { updatedAt: 'desc' },
            include: {
                priests: true,
                bookings: true,
                featuredMedia: true,
                categories: true, // 🔹
                venue: true, // 🔹
                gallery: { include: { media: true }, orderBy: { sortOrder: 'asc' } },
            }
        });
    }
    /** Get one by ID (allows archived too for detail pages/history) */
    findOne(id) {
        return this.prisma.pooja.findUnique({
            where: { id },
            include: {
                priests: true,
                bookings: true,
                featuredMedia: true,
                categories: true, // 🔹
                venue: true, // 🔹
                gallery: { include: { media: true }, orderBy: { sortOrder: 'asc' } },
            }
        });
    }
    /** Create using pure JSON */
    async createFromJson(dto) {
        const { name, priestIds, categoryIds, amount, durationMin, prepTimeMin, bufferMin, isInVenue, isOutsideVenue, date, time, venueId, venueAddress, mapLink, allowedZones, includeFood, includeHall, materials, notes, description, featuredMediaId, clearFeaturedMedia, } = dto;
        const data = {
            name,
            amount,
            durationMin,
            prepTimeMin,
            bufferMin,
            isInVenue,
            isOutsideVenue,
            ...(date ? { date: new Date(date) } : {}),
            ...(time ? { time: new Date(time) } : {}),
            // in-venue relation (optional)
            ...(typeof venueId === 'number' ? { venue: { connect: { id: venueId } } } : {}),
            // outside-venue fields
            venueAddress: venueAddress ?? null,
            mapLink: mapLink ?? null,
            ...(allowedZones !== undefined ? { allowedZones } : {}),
            includeFood: includeFood ?? false,
            includeHall: includeHall ?? false,
            materials: materials ?? null,
            notes: notes ?? null,
            description: description ?? null,
            // relations
            priests: { connect: (priestIds ?? []).map(id => ({ id })) },
            ...(categoryIds?.length ? { categories: { connect: categoryIds.map(id => ({ id })) } } : {}),
        };
        // ✅ On CREATE: either connect or omit
        if (!clearFeaturedMedia && typeof featuredMediaId === 'number') {
            data.featuredMedia = { connect: { id: featuredMediaId } };
        }
        return this.prisma.pooja.create({
            data,
            include: {
                featuredMedia: true,
                categories: true,
                venue: true,
                gallery: { include: { media: true }, orderBy: { sortOrder: 'asc' } },
                priests: true,
                bookings: true,
            },
        });
    }
    /** Update using pure JSON */
    async updateFromJson(id, dto) {
        await this.ensureExists(id);
        const data = {};
        if (dto.name !== undefined)
            data.name = dto.name;
        if (dto.amount !== undefined)
            data.amount = dto.amount;
        if (dto.durationMin !== undefined)
            data.durationMin = dto.durationMin;
        if (dto.prepTimeMin !== undefined)
            data.prepTimeMin = dto.prepTimeMin;
        if (dto.bufferMin !== undefined)
            data.bufferMin = dto.bufferMin;
        if (dto.isInVenue !== undefined)
            data.isInVenue = dto.isInVenue;
        if (dto.isOutsideVenue !== undefined)
            data.isOutsideVenue = dto.isOutsideVenue;
        if (dto.date !== undefined)
            data.date = dto.date ? new Date(dto.date) : null;
        if (dto.time !== undefined)
            data.time = dto.time ? new Date(dto.time) : null;
        // venue link toggle
        if (dto.venueId !== undefined) {
            const v = dto.venueId;
            if (v === null) {
                data.venue = { disconnect: true };
            }
            else if (typeof v === 'number') {
                data.venue = { connect: { id: v } };
            }
        }
        if (dto.venueAddress !== undefined)
            data.venueAddress = dto.venueAddress ?? null;
        if (dto.mapLink !== undefined)
            data.mapLink = dto.mapLink ?? null;
        if (dto.allowedZones !== undefined)
            data.allowedZones = dto.allowedZones;
        if (dto.includeFood !== undefined)
            data.includeFood = dto.includeFood;
        if (dto.includeHall !== undefined)
            data.includeHall = dto.includeHall;
        if (dto.materials !== undefined)
            data.materials = dto.materials ?? null;
        if (dto.notes !== undefined)
            data.notes = dto.notes ?? null;
        if (dto.description !== undefined)
            data.description = dto.description ?? null;
        if (dto.priestIds !== undefined) {
            data.priests = { set: (dto.priestIds ?? []).map(i => ({ id: i })) };
        }
        // 🔹 categories (replace whole set if provided)
        if (dto.categoryIds !== undefined) {
            const ids = (dto.categoryIds ?? [])
                .map(Number)
                .filter((n) => Number.isFinite(n)); // <-- typed param fixes TS7006
            data.categories = { set: ids.map(id => ({ id })) };
        }
        if (dto.clearFeaturedMedia) {
            data.featuredMedia = { disconnect: true };
        }
        else if (typeof dto.featuredMediaId === 'number') {
            data.featuredMedia = { connect: { id: dto.featuredMediaId } };
        }
        return this.prisma.pooja.update({
            where: { id },
            data,
            include: {
                featuredMedia: true,
                categories: true,
                venue: true,
                gallery: { include: { media: true }, orderBy: { sortOrder: 'asc' } },
                priests: true,
                bookings: true,
            }
        });
    }
    /**
     * Delete a pooja
     * - Default: SOFT DELETE (archive) → sets deletedAt, bookings remain intact
     * - Hard delete (`force=true`): only allowed if there are NO bookings
     */
    async remove(id, force = false) {
        const pooja = await this.prisma.pooja.findUnique({
            where: { id },
            include: { bookings: { select: { id: true } } }
        });
        if (!pooja)
            throw new common_1.NotFoundException('Pooja not found');
        if (force) {
            if (pooja.bookings.length > 0) {
                throw new common_1.BadRequestException('Cannot hard delete: bookings exist. The pooja has been kept to preserve booking history.');
            }
            return this.prisma.$transaction(async (tx) => {
                // clear m:n relations + gallery, then delete
                await tx.pooja.update({
                    where: { id },
                    data: { priests: { set: [] }, categories: { set: [] } }
                });
                await tx.poojaMedia.deleteMany({ where: { poojaId: id } });
                return tx.pooja.delete({ where: { id } });
            });
        }
        return this.prisma.pooja.update({
            where: { id },
            data: { deletedAt: new Date() }
        });
    }
    // ---- Media picker utilities ----
    async setFeaturedMedia(poojaId, mediaId) {
        await this.ensureExists(poojaId);
        if (mediaId) {
            const exists = await this.prisma.mediaAsset.count({ where: { id: mediaId } });
            if (!exists)
                throw new common_1.BadRequestException('mediaId not found');
        }
        return this.prisma.pooja.update({
            where: { id: poojaId },
            data: { featuredMediaId: mediaId },
            include: {
                featuredMedia: true,
                categories: true,
                venue: true,
                gallery: { include: { media: true }, orderBy: { sortOrder: 'asc' } },
            },
        });
    }
    async addToGallery(poojaId, mediaIds) {
        await this.ensureExists(poojaId);
        if (!mediaIds?.length)
            return { ok: true };
        const ids = [...new Set(mediaIds)];
        const count = await this.prisma.mediaAsset.count({ where: { id: { in: ids } } });
        if (count !== ids.length)
            throw new common_1.BadRequestException('Some mediaIds do not exist');
        const max = await this.prisma.poojaMedia.aggregate({
            where: { poojaId },
            _max: { sortOrder: true },
        });
        let start = (max._max.sortOrder ?? -1) + 1;
        await this.prisma.poojaMedia.createMany({
            data: ids.map(mid => ({ poojaId, mediaId: mid, sortOrder: start++ })),
            skipDuplicates: true,
        });
        return this.prisma.pooja.findUnique({
            where: { id: poojaId },
            include: { gallery: { include: { media: true }, orderBy: { sortOrder: 'asc' } } },
        });
    }
    async reorderGallery(poojaId, orders) {
        await this.ensureExists(poojaId);
        await this.prisma.poojaMedia.deleteMany({ where: { poojaId } });
        const data = (orders ?? [])
            .slice()
            .sort((a, b) => a.sortOrder - b.sortOrder)
            .map((o, i) => ({ poojaId, mediaId: o.mediaId, sortOrder: i }));
        if (data.length)
            await this.prisma.poojaMedia.createMany({ data });
        return { ok: true };
    }
    async removeFromGallery(poojaId, mediaId) {
        await this.ensureExists(poojaId);
        await this.prisma.poojaMedia.deleteMany({ where: { poojaId, mediaId } });
        return { ok: true };
    }
    // ---- utils ----
    async ensureExists(id) {
        const exists = await this.prisma.pooja.count({ where: { id } });
        if (!exists)
            throw new common_1.NotFoundException('Pooja not found');
    }
};
exports.PoojaService = PoojaService;
exports.PoojaService = PoojaService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], PoojaService);
//# sourceMappingURL=pooja.service.js.map
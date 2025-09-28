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
exports.PriestService = void 0;
// src/priest/priest.service.ts
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma.service");
const date_fns_1 = require("date-fns");
const timezone_util_1 = require("../common/timezone.util");
let PriestService = class PriestService {
    constructor(prisma) {
        this.prisma = prisma;
        this.tzUtil = new timezone_util_1.TimezoneUtil(prisma);
    }
    // -------------------------------
    // Priest CRUD
    // -------------------------------
    async createPriest(dto) {
        const data = {
            name: dto.name,
            specialty: dto.specialty ?? null,
            contactNo: dto.contactNo ?? null,
            email: dto.email ?? null,
            address: dto.address ?? null,
            languages: dto.languages ?? [],
            qualifications: dto.qualifications ?? [],
        };
        if (!dto.clearFeaturedMedia && typeof dto.featuredMediaId === 'number') {
            ;
            data.featuredMedia = { connect: { id: dto.featuredMediaId } };
        }
        return this.prisma.priest.create({
            data,
            include: { featuredMedia: true },
        });
    }
    async getAllPriests() {
        const list = await this.prisma.priest.findMany({
            include: { slots: true, bookings: true, featuredMedia: true },
            orderBy: { id: 'desc' },
        });
        // Convert slots back to configured timezone
        return Promise.all(list.map(async (p) => ({
            ...p,
            slots: await Promise.all(p.slots.map(async (s) => ({
                ...s,
                start: await this.tzUtil.fromUTC(s.start),
                end: await this.tzUtil.fromUTC(s.end),
                date: s.date ? await this.tzUtil.fromUTC(s.date) : null,
            }))),
        })));
    }
    async getPriest(id) {
        const p = await this.prisma.priest.findUnique({
            where: { id },
            include: { slots: true, bookings: true, featuredMedia: true },
        });
        if (!p)
            return null;
        return {
            ...p,
            slots: await Promise.all(p.slots.map(async (s) => ({
                ...s,
                start: await this.tzUtil.fromUTC(s.start),
                end: await this.tzUtil.fromUTC(s.end),
                date: s.date ? await this.tzUtil.fromUTC(s.date) : null,
            }))),
        };
    }
    async updatePriest(id, dto) {
        const data = {
            ...(dto.name !== undefined && { name: dto.name }),
            ...(dto.specialty !== undefined && { specialty: dto.specialty }),
            ...(dto.contactNo !== undefined && { contactNo: dto.contactNo }),
            ...(dto.email !== undefined && { email: dto.email }),
            ...(dto.address !== undefined && { address: dto.address }),
            ...(dto.languages !== undefined && { languages: dto.languages }),
            ...(dto.qualifications !== undefined && { qualifications: dto.qualifications }),
        };
        if (dto.clearFeaturedMedia) {
            Object.assign(data, { featuredMedia: { disconnect: true } });
        }
        else if (typeof dto.featuredMediaId === 'number') {
            Object.assign(data, { featuredMedia: { connect: { id: dto.featuredMediaId } } });
        }
        return this.prisma.priest.update({
            where: { id },
            data,
            include: { featuredMedia: true },
        });
    }
    async deletePriest(id) {
        return this.prisma.priest.delete({ where: { id } });
    }
    // -------------------------------
    // AvailabilitySlot CRUD
    // -------------------------------
    async createSlot(dto) {
        const startUTC = await this.tzUtil.toUTC(dto.start);
        const endUTC = await this.tzUtil.toUTC(dto.end);
        const dateUTC = dto.date ? await this.tzUtil.toUTC(dto.date) : null;
        if (!dto.disabled) {
            const overlap = await this.prisma.availabilitySlot.findFirst({
                where: {
                    priestId: dto.priestId,
                    disabled: false,
                    start: { lte: endUTC },
                    end: { gte: startUTC },
                },
            });
            if (overlap)
                throw new common_1.BadRequestException('Conflicting slot already exists.');
        }
        const created = await this.prisma.availabilitySlot.create({
            data: {
                priestId: dto.priestId,
                start: startUTC,
                end: endUTC,
                disabled: dto.disabled,
                type: dto.type,
                ...(dateUTC && { date: dateUTC }),
                ...(dto.daysOfWeek && { daysOfWeek: dto.daysOfWeek }),
            },
        });
        return {
            ...created,
            start: await this.tzUtil.fromUTC(created.start),
            end: await this.tzUtil.fromUTC(created.end),
            date: created.date ? await this.tzUtil.fromUTC(created.date) : null,
        };
    }
    async getSlotsForPriest(priestId) {
        const list = await this.prisma.availabilitySlot.findMany({ where: { priestId } });
        return Promise.all(list.map(async (s) => ({
            ...s,
            start: await this.tzUtil.fromUTC(s.start),
            end: await this.tzUtil.fromUTC(s.end),
            date: s.date ? await this.tzUtil.fromUTC(s.date) : null,
        })));
    }
    async updateSlot(id, dto) {
        const data = {
            ...(dto.priestId !== undefined && { priestId: dto.priestId }),
            ...(dto.start !== undefined && { start: await this.tzUtil.toUTC(dto.start) }),
            ...(dto.end !== undefined && { end: await this.tzUtil.toUTC(dto.end) }),
            ...(dto.disabled !== undefined && { disabled: dto.disabled }),
            ...(dto.type !== undefined && { type: dto.type }),
            ...(dto.daysOfWeek !== undefined && { daysOfWeek: dto.daysOfWeek }),
            ...(dto.date !== undefined && { date: await this.tzUtil.toUTC(dto.date) }),
        };
        const updated = await this.prisma.availabilitySlot.update({ where: { id }, data });
        return {
            ...updated,
            start: await this.tzUtil.fromUTC(updated.start),
            end: await this.tzUtil.fromUTC(updated.end),
            date: updated.date ? await this.tzUtil.fromUTC(updated.date) : null,
        };
    }
    async getSlotsForPriestInRange(priestId, from, to) {
        const list = await this.prisma.availabilitySlot.findMany({
            where: { priestId, start: { gte: from }, end: { lte: to } },
            orderBy: { start: 'asc' },
        });
        return Promise.all(list.map(async (s) => ({
            ...s,
            start: await this.tzUtil.fromUTC(s.start),
            end: await this.tzUtil.fromUTC(s.end),
            date: s.date ? await this.tzUtil.fromUTC(s.date) : null,
        })));
    }
    async deleteSlot(id) {
        return this.prisma.availabilitySlot.delete({ where: { id } });
    }
    // -------------------------------
    // Availability finder
    // -------------------------------
    async getAvailableChunks(priestId, bookingDate, totalMinutes) {
        const dateObj = await this.tzUtil.toUTC(bookingDate); // interpret in configured TZ → UTC
        const weekdayShort = (0, date_fns_1.format)(new Date(bookingDate), 'EEE'); // still local label for recurring
        const availSlots = await this.prisma.availabilitySlot.findMany({
            where: { priestId, disabled: false, OR: [{ date: dateObj }, { date: null }] },
        });
        const busySlots = await this.prisma.availabilitySlot.findMany({
            where: { priestId, disabled: true, date: dateObj },
        });
        const validChunks = [];
        for (const slot of availSlots) {
            if (!slot.date) {
                const days = Array.isArray(slot.daysOfWeek)
                    ? slot.daysOfWeek
                    : typeof slot.daysOfWeek === 'string'
                        ? JSON.parse(slot.daysOfWeek)
                        : [];
                if (!days.includes(weekdayShort))
                    continue;
            }
            // reconstruct local-day slots from stored UTC times
            const start = new Date(bookingDate);
            start.setHours(slot.start.getUTCHours(), slot.start.getUTCMinutes(), 0, 0);
            const end = new Date(bookingDate);
            end.setHours(slot.end.getUTCHours(), slot.end.getUTCMinutes(), 0, 0);
            if (end <= start)
                end.setDate(end.getDate() + 1);
            const chunks = this.generateChunks(start, end, totalMinutes);
            validChunks.push(...chunks.map(c => ({ ...c, priestId: slot.priestId, type: slot.type })));
        }
        const busyRanges = busySlots.map(slot => {
            const bs = new Date(bookingDate);
            bs.setHours(slot.start.getUTCHours(), slot.start.getUTCMinutes(), 0, 0);
            const be = new Date(bookingDate);
            be.setHours(slot.end.getUTCHours(), slot.end.getUTCMinutes(), 0, 0);
            if (be <= bs)
                be.setDate(be.getDate() + 1);
            return { start: bs, end: be };
        });
        const existing = await this.prisma.booking.findMany({ where: { priestId, bookingDate: dateObj } });
        const available = validChunks.filter(chunk => !existing.some(b => this.overlaps(chunk.start, chunk.end, b.start, b.end)) &&
            !busyRanges.some(b => this.overlaps(chunk.start, chunk.end, b.start, b.end)));
        // Convert back to timezone strings for frontend
        return Promise.all(available.map(async (c) => ({
            ...c,
            start: await this.tzUtil.fromUTC(c.start),
            end: await this.tzUtil.fromUTC(c.end),
        })));
    }
    generateChunks(start, end, durationMin) {
        const chunks = [];
        let current = new Date(start);
        while ((0, date_fns_1.addMinutes)(current, durationMin) <= end) {
            const chunkEnd = (0, date_fns_1.addMinutes)(current, durationMin);
            chunks.push({ start: new Date(current), end: chunkEnd });
            current = chunkEnd;
        }
        return chunks;
    }
    overlaps(aStart, aEnd, bStart, bEnd) {
        return aStart < bEnd && aEnd > bStart;
    }
};
exports.PriestService = PriestService;
exports.PriestService = PriestService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], PriestService);
//# sourceMappingURL=priest.service.js.map
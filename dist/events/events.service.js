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
Object.defineProperty(exports, "__esModule", { value: true });
exports.EventsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma.service");
const fs = require("fs");
const path = require("path");
let EventsService = class EventsService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    /** Save an uploaded file buffer to disk and return its public URL */
    async savePhotoAndGetUrl(file) {
        const uploadsDir = path.join(__dirname, '..', '..', 'uploads');
        if (!fs.existsSync(uploadsDir)) {
            fs.mkdirSync(uploadsDir, { recursive: true });
        }
        const fileName = Date.now() + '-' + file.originalname.replace(/\s+/g, '_');
        const filePath = path.join(uploadsDir, fileName);
        fs.writeFileSync(filePath, file.buffer);
        return `/uploads/${fileName}`;
    }
    /** Create a new event */
    async create(createDto) {
        return this.prisma.event.create({
            data: {
                ...createDto,
                tags: createDto.tags ?? undefined,
            },
        });
    }
    /** List all events */
    findAll() {
        return this.prisma.event.findMany({ orderBy: { date: 'asc' } });
    }
    /** Get one event */
    async findOne(id) {
        const ev = await this.prisma.event.findUnique({ where: { id } });
        if (!ev)
            throw new common_1.NotFoundException(`Event ${id} not found`);
        return ev;
    }
    /** Update an existing event */
    async update(id, updateDto) {
        await this.findOne(id);
        return this.prisma.event.update({
            where: { id },
            data: {
                ...updateDto,
                tags: updateDto.tags ?? undefined,
            },
        });
    }
    /** Delete an event */
    async remove(id) {
        await this.findOne(id);
        return this.prisma.event.delete({ where: { id } });
    }
    /**
     * Guest booking: reserve `pax` seats without requiring a user account.
     * Stores contact info in the booking record.
     */
    async bookEventAsGuest(eventId, dto) {
        // 1) Ensure event exists
        const ev = await this.prisma.event.findUnique({ where: { id: eventId } });
        if (!ev)
            throw new common_1.NotFoundException(`Event ${eventId} not found`);
        // 2) Enforce capacity if set
        if (ev.capacity != null) {
            const aggregate = await this.prisma.eventBooking.aggregate({
                where: { eventId, status: 'confirmed' },
                _sum: { pax: true },
            });
            const alreadyBooked = aggregate._sum.pax ?? 0;
            if (alreadyBooked + dto.pax > ev.capacity) {
                throw new common_1.BadRequestException('Not enough seats available');
            }
        }
        // 3) Create booking record
        return this.prisma.eventBooking.create({
            data: {
                event: { connect: { id: eventId } },
                pax: dto.pax,
                userName: dto.userName ?? null,
                userEmail: dto.userEmail ?? null,
                userPhone: dto.userPhone ?? null,
                status: 'confirmed',
            },
        });
    }
    async findBookings(eventId) {
        // ensure the event exists
        const ev = await this.prisma.event.findUnique({ where: { id: eventId } });
        if (!ev)
            throw new common_1.NotFoundException(`Event ${eventId} not found`);
        // fetch and return
        return this.prisma.eventBooking.findMany({
            where: { eventId },
            orderBy: { bookedAt: 'desc' },
        });
    }
};
exports.EventsService = EventsService;
exports.EventsService = EventsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], EventsService);
//# sourceMappingURL=events.service.js.map
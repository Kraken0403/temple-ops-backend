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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var BookingController_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.BookingController = void 0;
const common_1 = require("@nestjs/common");
const passport_1 = require("@nestjs/passport");
const booking_service_1 = require("./booking.service");
const create_booking_dto_1 = require("./dto/create-booking.dto");
const update_booking_dto_1 = require("./dto/update-booking.dto");
const quote_booking_dto_1 = require("./dto/quote-booking.dto");
const prisma_service_1 = require("../prisma.service");
let BookingController = BookingController_1 = class BookingController {
    constructor(svc, prisma) {
        this.svc = svc;
        this.prisma = prisma;
        this.logger = new common_1.Logger(BookingController_1.name);
    }
    /* ─────────────── PUBLIC (GUEST ALLOWED) ─────────────── */
    /**
     * ✅ Pricing preview
     * Guests + logged-in users
     */
    quote(dto) {
        return this.svc.quote(dto);
    }
    /**
     * ✅ Create booking
     * Guests + logged-in users
     */
    create(dto) {
        // console.log('📥 CREATE BOOKING DTO:', dto)
        return this.svc.create(dto);
    }
    /* ─────────────── AUTH REQUIRED ─────────────── */
    /**
     * Priest “My Bookings”
     */
    async findMine(req, priestIdQuery) {
        const user = req?.user;
        this.logger.debug(`booking/my user: ${JSON.stringify(user)}`);
        const isAdmin = await this.isAdminDb(user?.id);
        let priestId = null;
        if (isAdmin && priestIdQuery) {
            const parsed = Number(priestIdQuery);
            if (!Number.isFinite(parsed) || parsed <= 0) {
                throw new common_1.BadRequestException('Query param priestId must be a positive number');
            }
            priestId = parsed;
        }
        else {
            priestId = await this.resolvePriestIdFromDb(user);
        }
        if (!priestId) {
            throw new common_1.ForbiddenException('Your account is not linked to a Priest profile.');
        }
        return this.svc.findAllByPriest(priestId);
    }
    /**
     * Admin / staff overview
     */
    findAll() {
        return this.svc.findAll();
    }
    /**
     * View single booking (admin / priest)
     */
    async findOne(id) {
        const booking = await this.svc.findOne(id);
        if (!booking)
            throw new common_1.NotFoundException('Booking not found');
        return booking;
    }
    /**
     * Update booking
     */
    async update(id, dto) {
        const updated = await this.svc.update(id, dto);
        if (!updated)
            throw new common_1.NotFoundException('Booking not found');
        return updated;
    }
    /**
     * Update booking status
     */
    updateStatus(id, status) {
        return this.svc.update(id, { status });
    }
    /**
     * Delete booking
     */
    async remove(id) {
        await this.svc.remove(id);
        return { ok: true };
    }
    /* ─────────────── Helpers ─────────────── */
    async isAdminDb(userId) {
        if (!userId)
            return false;
        const uid = Number(userId);
        if (!Number.isFinite(uid))
            return false;
        const roles = await this.prisma.userRole.findMany({
            where: { userId: uid },
            include: { role: true },
        });
        return roles.some(r => r.role?.name?.toLowerCase() === 'admin');
    }
    async resolvePriestIdFromDb(user) {
        if (!user?.id)
            return null;
        const uid = Number(user.id);
        if (!Number.isFinite(uid))
            return null;
        const u = await this.prisma.user.findUnique({
            where: { id: uid },
            select: { priestId: true, email: true },
        });
        if (u?.priestId)
            return u.priestId;
        if (u?.email) {
            const p = await this.prisma.priest.findFirst({
                where: { email: u.email },
                select: { id: true },
            });
            return p?.id ?? null;
        }
        return null;
    }
};
exports.BookingController = BookingController;
__decorate([
    (0, common_1.Post)('quote'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [quote_booking_dto_1.QuoteBookingDto]),
    __metadata("design:returntype", void 0)
], BookingController.prototype, "quote", null);
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_booking_dto_1.CreateBookingDto]),
    __metadata("design:returntype", void 0)
], BookingController.prototype, "create", null);
__decorate([
    (0, common_1.Get)('my'),
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt')),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Query)('priestId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], BookingController.prototype, "findMine", null);
__decorate([
    (0, common_1.Get)(),
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], BookingController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt')),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], BookingController.prototype, "findOne", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt')),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, update_booking_dto_1.UpdateBookingDto]),
    __metadata("design:returntype", Promise)
], BookingController.prototype, "update", null);
__decorate([
    (0, common_1.Patch)(':id/status/:status'),
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt')),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Param)('status')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, String]),
    __metadata("design:returntype", void 0)
], BookingController.prototype, "updateStatus", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt')),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], BookingController.prototype, "remove", null);
exports.BookingController = BookingController = BookingController_1 = __decorate([
    (0, common_1.Controller)('booking'),
    __metadata("design:paramtypes", [booking_service_1.BookingService,
        prisma_service_1.PrismaService])
], BookingController);
//# sourceMappingURL=booking.controller.js.map
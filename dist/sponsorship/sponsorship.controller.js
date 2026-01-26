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
Object.defineProperty(exports, "__esModule", { value: true });
exports.SponsorshipController = void 0;
const common_1 = require("@nestjs/common");
const sponsorship_service_1 = require("./sponsorship.service");
const create_sponsorship_type_dto_1 = require("./dto/create-sponsorship-type.dto");
const create_event_sponsorship_dto_1 = require("./dto/create-event-sponsorship.dto");
const create_sponsorship_booking_dto_1 = require("./dto/create-sponsorship-booking.dto");
const update_sponsorship_type_dto_1 = require("./dto/update-sponsorship-type.dto");
const update_event_sponsorship_dto_1 = require("./dto/update-event-sponsorship.dto");
const update_sponsorship_booking_dto_1 = require("./dto/update-sponsorship-booking.dto");
let SponsorshipController = class SponsorshipController {
    constructor(svc) {
        this.svc = svc;
    }
    // 1. Create sponsorship type (admin)
    createType(dto) {
        return this.svc.createType(dto);
    }
    // 1b. Update sponsorship type (admin)
    updateType(id, dto) {
        return this.svc.updateType(id, dto);
    }
    // 2. Assign sponsorship type to an event (admin)
    assignToEvent(dto) {
        return this.svc.assignToEvent(dto);
    }
    // 2b. Update an event sponsorship (admin) — by EventSponsorship `id`
    updateEventSponsorship(eventSponsorshipId, dto) {
        return this.svc.updateEventSponsorship(eventSponsorshipId, dto);
    }
    // list all event sponsorship rows
    getAllEventSponsorships() {
        return this.svc.getAllEventSponsorships();
    }
    // list all sponsorship types (admin)
    getAllTypes() {
        return this.svc.getAllTypes();
    }
    // 3. Book sponsorship (public)
    book(dto) {
        return this.svc.book(dto);
    }
    // 3b. Update booking (optional; admin or authorized staff)
    updateBooking(id, dto) {
        return this.svc.updateBooking(id, dto);
    }
    async getAllBookings() {
        return this.svc.getAllBookings();
    }
    async getEventSponsorshipById(id) {
        const sponsorship = await this.svc.getEventSponsorshipById(id);
        if (!sponsorship) {
            throw new common_1.NotFoundException('Sponsorship not found');
        }
        return sponsorship;
    }
    // 4. Get all sponsorships for a specific event (public)
    async getSponsorships(eventId) {
        const sponsorships = await this.svc.getSponsorshipsForEvent(eventId);
        if (!sponsorships || sponsorships.length === 0) {
            throw new common_1.NotFoundException('No sponsorships found for this event');
        }
        return sponsorships;
    }
    async deleteType(id, force) {
        const doForce = force === 'true';
        if (doForce) {
            return this.svc.deleteTypeForce(id);
        }
        return this.svc.deleteTypeSafe(id);
    }
    /** Delete an EVENT SPONSORSHIP by its ID (also removes its bookings). */
    deleteEventSponsorshipById(id) {
        return this.svc.deleteEventSponsorshipById(id);
    }
    /** Delete by composite key (eventId + sponsorshipTypeId). */
    removeSponsorshipAssignment(eventId, sponsorshipTypeId) {
        return this.svc.removeSponsorshipAssignment(eventId, sponsorshipTypeId);
    }
    /** Delete a BOOKING by its ID. */
    deleteBooking(id) {
        return this.svc.deleteBooking(id);
    }
};
exports.SponsorshipController = SponsorshipController;
__decorate([
    (0, common_1.Post)('type'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_sponsorship_type_dto_1.CreateSponsorshipTypeDto]),
    __metadata("design:returntype", void 0)
], SponsorshipController.prototype, "createType", null);
__decorate([
    (0, common_1.Patch)('type/:id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, update_sponsorship_type_dto_1.UpdateSponsorshipTypeDto]),
    __metadata("design:returntype", void 0)
], SponsorshipController.prototype, "updateType", null);
__decorate([
    (0, common_1.Post)('event'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_event_sponsorship_dto_1.CreateEventSponsorshipDto]),
    __metadata("design:returntype", void 0)
], SponsorshipController.prototype, "assignToEvent", null);
__decorate([
    (0, common_1.Patch)('event/:eventSponsorshipId'),
    __param(0, (0, common_1.Param)('eventSponsorshipId', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, update_event_sponsorship_dto_1.UpdateEventSponsorshipDto]),
    __metadata("design:returntype", void 0)
], SponsorshipController.prototype, "updateEventSponsorship", null);
__decorate([
    (0, common_1.Get)('events'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], SponsorshipController.prototype, "getAllEventSponsorships", null);
__decorate([
    (0, common_1.Get)('types'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], SponsorshipController.prototype, "getAllTypes", null);
__decorate([
    (0, common_1.Post)('book'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_sponsorship_booking_dto_1.CreateSponsorshipBookingDto]),
    __metadata("design:returntype", void 0)
], SponsorshipController.prototype, "book", null);
__decorate([
    (0, common_1.Patch)('booking/:id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, update_sponsorship_booking_dto_1.UpdateSponsorshipBookingDto]),
    __metadata("design:returntype", void 0)
], SponsorshipController.prototype, "updateBooking", null);
__decorate([
    (0, common_1.Get)('bookings'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], SponsorshipController.prototype, "getAllBookings", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], SponsorshipController.prototype, "getEventSponsorshipById", null);
__decorate([
    (0, common_1.Get)('event/:eventId'),
    __param(0, (0, common_1.Param)('eventId', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], SponsorshipController.prototype, "getSponsorships", null);
__decorate([
    (0, common_1.Delete)('type/:id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Query)('force')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, String]),
    __metadata("design:returntype", Promise)
], SponsorshipController.prototype, "deleteType", null);
__decorate([
    (0, common_1.Delete)('event/by-id/:id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], SponsorshipController.prototype, "deleteEventSponsorshipById", null);
__decorate([
    (0, common_1.Delete)('event/:eventId/:sponsorshipTypeId'),
    __param(0, (0, common_1.Param)('eventId', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Param)('sponsorshipTypeId', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Number]),
    __metadata("design:returntype", void 0)
], SponsorshipController.prototype, "removeSponsorshipAssignment", null);
__decorate([
    (0, common_1.Delete)('booking/:id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], SponsorshipController.prototype, "deleteBooking", null);
exports.SponsorshipController = SponsorshipController = __decorate([
    (0, common_1.Controller)('sponsorship'),
    __metadata("design:paramtypes", [sponsorship_service_1.SponsorshipService])
], SponsorshipController);
//# sourceMappingURL=sponsorship.controller.js.map
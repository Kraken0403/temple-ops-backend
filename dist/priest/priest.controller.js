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
exports.PriestController = void 0;
const common_1 = require("@nestjs/common");
const priest_service_1 = require("./priest.service");
const create_priest_dto_1 = require("./dto/create-priest.dto");
const update_priest_dto_1 = require("./dto/update-priest.dto");
const create_slot_dto_1 = require("./dto/create-slot.dto");
const update_slot_dto_1 = require("./dto/update-slot.dto");
let PriestController = class PriestController {
    constructor(svc) {
        this.svc = svc;
    }
    // Priest endpoints
    async createPriest(dto) {
        return this.svc.createPriest(dto);
    }
    async getAll() {
        return this.svc.getAllPriests();
    }
    async getOne(id) {
        return this.svc.getPriest(id);
    }
    async updatePriest(id, dto) {
        return this.svc.updatePriest(id, dto);
    }
    async deletePriest(id) {
        return this.svc.deletePriest(id);
    }
    // AvailabilitySlot endpoints
    async createSlot(dto) {
        return this.svc.createSlot(dto);
    }
    async getSlots(priestId) {
        return this.svc.getSlotsForPriest(priestId);
    }
    async updateSlot(id, dto) {
        return this.svc.updateSlot(id, dto);
    }
    async deleteSlot(id) {
        return this.svc.deleteSlot(id);
    }
    async getAvailableChunks(priestId, duration, totalMinutes, date, bookingDate) {
        const finalDate = date ?? bookingDate;
        const minutes = Number(duration ?? totalMinutes);
        if (!finalDate)
            throw new common_1.BadRequestException('Date/bookingDate is required');
        if (!minutes || Number.isNaN(minutes))
            throw new common_1.BadRequestException('duration/totalMinutes must be a positive number');
        return this.svc.getAvailableChunks(priestId, finalDate, minutes);
    }
};
exports.PriestController = PriestController;
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_priest_dto_1.CreatePriestDto]),
    __metadata("design:returntype", Promise)
], PriestController.prototype, "createPriest", null);
__decorate([
    (0, common_1.Get)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], PriestController.prototype, "getAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], PriestController.prototype, "getOne", null);
__decorate([
    (0, common_1.Patch)(':id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, update_priest_dto_1.UpdatePriestDto]),
    __metadata("design:returntype", Promise)
], PriestController.prototype, "updatePriest", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], PriestController.prototype, "deletePriest", null);
__decorate([
    (0, common_1.Post)('slot'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_slot_dto_1.CreateSlotDto]),
    __metadata("design:returntype", Promise)
], PriestController.prototype, "createSlot", null);
__decorate([
    (0, common_1.Get)(':priestId/slots'),
    __param(0, (0, common_1.Param)('priestId', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], PriestController.prototype, "getSlots", null);
__decorate([
    (0, common_1.Patch)('slot/:id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, update_slot_dto_1.UpdateSlotDto]),
    __metadata("design:returntype", Promise)
], PriestController.prototype, "updateSlot", null);
__decorate([
    (0, common_1.Delete)('slot/:id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], PriestController.prototype, "deleteSlot", null);
__decorate([
    (0, common_1.Get)(':priestId/available-chunks'),
    __param(0, (0, common_1.Param)('priestId', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Query)('duration')),
    __param(2, (0, common_1.Query)('totalMinutes')),
    __param(3, (0, common_1.Query)('date')),
    __param(4, (0, common_1.Query)('bookingDate')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, String, String, String, String]),
    __metadata("design:returntype", Promise)
], PriestController.prototype, "getAvailableChunks", null);
exports.PriestController = PriestController = __decorate([
    (0, common_1.Controller)('priest'),
    __metadata("design:paramtypes", [priest_service_1.PriestService])
], PriestController);
//# sourceMappingURL=priest.controller.js.map
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
exports.PoojaController = void 0;
const common_1 = require("@nestjs/common");
const pooja_service_1 = require("./pooja.service");
const create_pooja_json_dto_1 = require("./dto/create-pooja-json.dto");
const update_pooja_dto_1 = require("./dto/update-pooja.dto");
let PoojaController = class PoojaController {
    constructor(svc) {
        this.svc = svc;
    }
    findAll() { return this.svc.findAll(); }
    findOne(id) { return this.svc.findOne(id); }
    create(dto) { return this.svc.createFromJson(dto); }
    update(id, dto) {
        return this.svc.updateFromJson(id, dto);
    }
    remove(id, force) {
        return this.svc.remove(id, force === 'true');
    }
    // Media helpers
    setFeatured(id, mediaId) {
        if (mediaId !== null && mediaId !== undefined && Number.isNaN(Number(mediaId))) {
            throw new common_1.BadRequestException('mediaId must be a number or null');
        }
        return this.svc.setFeaturedMedia(id, mediaId ?? null);
    }
    addGallery(id, mediaIds) {
        return this.svc.addToGallery(id, mediaIds ?? []);
    }
    reorderGallery(id, orders) {
        return this.svc.reorderGallery(id, orders ?? []);
    }
    removeGallery(id, mediaId) {
        return this.svc.removeFromGallery(id, mediaId);
    }
};
exports.PoojaController = PoojaController;
__decorate([
    (0, common_1.Get)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], PoojaController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], PoojaController.prototype, "findOne", null);
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_pooja_json_dto_1.CreatePoojaJsonDto]),
    __metadata("design:returntype", void 0)
], PoojaController.prototype, "create", null);
__decorate([
    (0, common_1.Patch)(':id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, update_pooja_dto_1.UpdatePoojaDto]),
    __metadata("design:returntype", void 0)
], PoojaController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Query)('force')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, String]),
    __metadata("design:returntype", void 0)
], PoojaController.prototype, "remove", null);
__decorate([
    (0, common_1.Patch)(':id/featured-media'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)('mediaId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", void 0)
], PoojaController.prototype, "setFeatured", null);
__decorate([
    (0, common_1.Post)(':id/gallery'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)('mediaIds')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Array]),
    __metadata("design:returntype", void 0)
], PoojaController.prototype, "addGallery", null);
__decorate([
    (0, common_1.Patch)(':id/gallery'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Array]),
    __metadata("design:returntype", void 0)
], PoojaController.prototype, "reorderGallery", null);
__decorate([
    (0, common_1.Delete)(':id/gallery/:mediaId'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Param)('mediaId', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Number]),
    __metadata("design:returntype", void 0)
], PoojaController.prototype, "removeGallery", null);
exports.PoojaController = PoojaController = __decorate([
    (0, common_1.Controller)('pooja'),
    __metadata("design:paramtypes", [pooja_service_1.PoojaService])
], PoojaController);
//# sourceMappingURL=pooja.controller.js.map
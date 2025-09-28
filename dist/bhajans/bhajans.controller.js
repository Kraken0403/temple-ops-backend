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
exports.BhajansController = void 0;
// bhajans.controller.ts
const common_1 = require("@nestjs/common");
const bhajans_service_1 = require("./bhajans.service");
const create_bhajan_dto_1 = require("./dto/create-bhajan.dto");
const update_bhajan_dto_1 = require("./dto/update-bhajan.dto");
let BhajansController = class BhajansController {
    constructor(service) {
        this.service = service;
    }
    findAll(search, language, tag, categoryId, page, limit) {
        const toInt = (v) => {
            const n = v == null ? NaN : Number(v);
            return Number.isFinite(n) ? Math.trunc(n) : undefined;
        };
        return this.service.findAll({
            search,
            language,
            tag,
            categoryId: toInt(categoryId),
            page: toInt(page),
            limit: toInt(limit),
            publishedOnly: true,
        });
    }
    findOne(slug) {
        return this.service.findBySlug(slug);
    }
    create(dto) {
        return this.service.create(dto);
    }
    update(id, dto) {
        return this.service.update(Number(id), dto);
    }
    remove(id) {
        return this.service.remove(Number(id));
    }
};
exports.BhajansController = BhajansController;
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)('search')),
    __param(1, (0, common_1.Query)('language')),
    __param(2, (0, common_1.Query)('tag')),
    __param(3, (0, common_1.Query)('categoryId')),
    __param(4, (0, common_1.Query)('page')),
    __param(5, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String, String, String]),
    __metadata("design:returntype", void 0)
], BhajansController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':slug'),
    __param(0, (0, common_1.Param)('slug')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], BhajansController.prototype, "findOne", null);
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_bhajan_dto_1.CreateBhajanDto]),
    __metadata("design:returntype", void 0)
], BhajansController.prototype, "create", null);
__decorate([
    (0, common_1.Put)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_bhajan_dto_1.UpdateBhajanDto]),
    __metadata("design:returntype", void 0)
], BhajansController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], BhajansController.prototype, "remove", null);
exports.BhajansController = BhajansController = __decorate([
    (0, common_1.Controller)('bhajans'),
    __metadata("design:paramtypes", [bhajans_service_1.BhajansService])
], BhajansController);
//# sourceMappingURL=bhajans.controller.js.map
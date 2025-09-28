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
exports.StaticPagesController = void 0;
// src/static-pages/static-pages.controller.ts
const common_1 = require("@nestjs/common");
const platform_express_1 = require("@nestjs/platform-express");
const static_pages_service_1 = require("./static-pages.service");
let StaticPagesController = class StaticPagesController {
    constructor(svc) {
        this.svc = svc;
    }
    async getPage(slug) {
        const page = await this.svc.getPage(slug);
        if (!page)
            throw new common_1.NotFoundException('Page not found');
        return page;
    }
    // ✅ Create (frontend calls this when first saving)
    async createPage(body) {
        return this.svc.createPage(body.slug, body.content ?? {});
    }
    // ✅ Update (now safe via upsert)
    async updatePage(slug, body) {
        return this.svc.updatePage(slug, body.content ?? {});
    }
    // Upload photo used inside the editor HTML
    async uploadPhoto(file) {
        const url = await this.svc.savePhotoAndGetUrl(file);
        return { url }; // => "/uploads/..."
    }
};
exports.StaticPagesController = StaticPagesController;
__decorate([
    (0, common_1.Get)(':slug'),
    __param(0, (0, common_1.Param)('slug')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], StaticPagesController.prototype, "getPage", null);
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], StaticPagesController.prototype, "createPage", null);
__decorate([
    (0, common_1.Put)(':slug'),
    __param(0, (0, common_1.Param)('slug')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], StaticPagesController.prototype, "updatePage", null);
__decorate([
    (0, common_1.Post)('upload-photo'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('file')) // memory storage OK if you use your manual write
    ,
    __param(0, (0, common_1.UploadedFile)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], StaticPagesController.prototype, "uploadPhoto", null);
exports.StaticPagesController = StaticPagesController = __decorate([
    (0, common_1.Controller)('static-pages'),
    __metadata("design:paramtypes", [static_pages_service_1.StaticPagesService])
], StaticPagesController);
//# sourceMappingURL=static-pages.controller.js.map
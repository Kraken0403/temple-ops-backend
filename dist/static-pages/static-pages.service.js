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
exports.StaticPagesService = void 0;
// src/static-pages/static-pages.service.ts
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma.service");
const fs = require("fs");
const path = require("path");
let StaticPagesService = class StaticPagesService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getPage(slug) {
        return this.prisma.staticPage.findUnique({ where: { slug } });
    }
    async updatePage(slug, content) {
        return this.prisma.staticPage.update({
            where: { slug },
            data: { content },
        });
    }
    // ✅ Same upload handler as events
    async savePhotoAndGetUrl(file) {
        const uploadDir = path.join(__dirname, '..', '..', 'uploads');
        if (!fs.existsSync(uploadDir))
            fs.mkdirSync(uploadDir);
        const filename = Date.now() + '-' + file.originalname;
        const filepath = path.join(uploadDir, filename);
        await fs.promises.writeFile(filepath, file.buffer);
        return `/uploads/${filename}`;
    }
};
exports.StaticPagesService = StaticPagesService;
exports.StaticPagesService = StaticPagesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], StaticPagesService);
//# sourceMappingURL=static-pages.service.js.map
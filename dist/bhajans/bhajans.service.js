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
exports.BhajansService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma.service");
const slugify_1 = require("../common/validators/slugify");
let BhajansService = class BhajansService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    // bhajans.service.ts
    async remove(id) {
        try {
            return await this.prisma.bhajan.delete({ where: { id: Number(id) } });
        }
        catch (e) {
            // Prisma P2025 = record not found
            if (e?.code === 'P2025')
                throw new common_1.NotFoundException('Bhajan not found');
            throw e;
        }
    }
    async findAll(params) {
        let { search, language, tag, categoryId, page, limit, publishedOnly = true } = params;
        const num = (v, def, { min = 1, max = 500 } = {}) => {
            const n = Number(v);
            if (!Number.isFinite(n))
                return def;
            const i = Math.trunc(n);
            return Math.max(min, Math.min(max, i));
        };
        const _page = num(page, 1, { min: 1, max: 1000000 });
        const _limit = num(limit, 12, { min: 1, max: 200 });
        const where = {};
        if (publishedOnly)
            where.isPublished = true;
        if (language)
            where.language = language;
        if (categoryId != null && Number.isFinite(categoryId))
            where.categoryId = Number(categoryId);
        if (search)
            where.OR = [
                { title: { contains: search, mode: 'insensitive' } },
                { lyricsHtml: { contains: search, mode: 'insensitive' } },
            ];
        if (tag)
            where.tagsJson = { contains: `"${tag}"` };
        const [items, total] = await this.prisma.$transaction([
            this.prisma.bhajan.findMany({
                where,
                orderBy: { publishedAt: 'desc' },
                skip: (_page - 1) * _limit,
                take: _limit,
            }),
            this.prisma.bhajan.count({ where }),
        ]);
        return { items, total, page: _page, limit: _limit };
    }
    async findBySlug(slug) {
        const bhajan = await this.prisma.bhajan.findUnique({ where: { slug } });
        if (!bhajan)
            throw new common_1.NotFoundException('Bhajan not found');
        // increment views (fire and forget)
        this.prisma.bhajan.update({
            where: { id: bhajan.id }, data: { viewsCount: { increment: 1 } }
        }).catch(() => { });
        return bhajan;
    }
    async create(dto) {
        const slug = dto.slug ? (0, slugify_1.toSlug)(dto.slug) : (0, slugify_1.toSlug)(dto.title);
        return this.prisma.bhajan.create({
            data: {
                title: dto.title,
                slug,
                language: dto.language,
                categoryId: dto.categoryId ? Number(dto.categoryId) : undefined,
                pdfUrl: dto.pdfUrl,
                lyricsHtml: dto.lyricsHtml,
                audioUrl: dto.audioUrl,
                thumbnailUrl: dto.thumbnailUrl,
                isPublished: dto.isPublished ?? true,
                tagsJson: dto.tags ? JSON.stringify(dto.tags) : null,
            }
        });
    }
    // src/bhajans/bhajans.service.ts
    async update(id, dto) {
        const norm = (s) => (s && s.trim() ? s.trim() : null);
        const data = {
            // only include keys that exist in the Prisma model
            title: dto.title !== undefined ? norm(dto.title) : undefined,
            pdfUrl: dto.pdfUrl !== undefined ? norm(dto.pdfUrl) : undefined,
            lyricsHtml: dto.lyricsHtml !== undefined ? norm(dto.lyricsHtml) : undefined,
            audioUrl: dto.audioUrl !== undefined ? norm(dto.audioUrl) : undefined,
            thumbnailUrl: dto.thumbnailUrl !== undefined ? norm(dto.thumbnailUrl) : undefined,
            isPublished: dto.isPublished, // boolean or undefined is fine
        };
        if (dto.slug !== undefined)
            data.slug = dto.slug ? (0, slugify_1.toSlug)(dto.slug) : undefined;
        if (dto.language !== undefined)
            data.language = norm(dto.language); // if you still keep it in schema
        if (dto.categoryId !== undefined)
            data.categoryId = dto.categoryId ? Number(dto.categoryId) : null;
        if (dto.tags !== undefined)
            data.tagsJson = dto.tags && dto.tags.length ? JSON.stringify(dto.tags) : null;
        // remove undefined so Prisma only updates provided fields
        Object.keys(data).forEach((k) => data[k] === undefined && delete data[k]);
        return this.prisma.bhajan.update({
            where: { id: Number(id) },
            data,
        });
    }
};
exports.BhajansService = BhajansService;
exports.BhajansService = BhajansService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], BhajansService);
//# sourceMappingURL=bhajans.service.js.map
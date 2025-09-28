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
exports.BlogsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma.service");
const slugify_1 = require("../common/validators/slugify");
let BlogsService = class BlogsService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findAll(params) {
        const { search, tag, categoryId, page = 1, limit = 12, publishedOnly = true } = params;
        const where = {};
        if (publishedOnly)
            where.isPublished = true;
        if (categoryId)
            where.categoryId = Number(categoryId);
        if (search)
            where.OR = [
                { title: { contains: search, mode: 'insensitive' } },
                { excerpt: { contains: search, mode: 'insensitive' } },
                { bodyHtml: { contains: search, mode: 'insensitive' } },
            ];
        if (tag)
            where.tagsJson = { contains: `"${tag}"` };
        const [items, total] = await this.prisma.$transaction([
            this.prisma.blog.findMany({
                where,
                orderBy: { publishedAt: 'desc' },
                skip: (page - 1) * limit,
                take: limit,
            }),
            this.prisma.blog.count({ where }),
        ]);
        return { items, total, page, limit };
    }
    async findBySlug(slug) {
        const blog = await this.prisma.blog.findUnique({ where: { slug } });
        if (!blog)
            throw new common_1.NotFoundException('Blog not found');
        return blog;
    }
    async create(dto) {
        const slug = dto.slug ? (0, slugify_1.toSlug)(dto.slug) : (0, slugify_1.toSlug)(dto.title);
        return this.prisma.blog.create({
            data: {
                title: dto.title,
                slug,
                excerpt: dto.excerpt,
                coverImageUrl: dto.coverImageUrl,
                bodyHtml: dto.bodyHtml,
                authorName: dto.authorName,
                isPublished: dto.isPublished ?? true,
                categoryId: dto.categoryId ? Number(dto.categoryId) : undefined,
                tagsJson: dto.tags ? JSON.stringify(dto.tags) : null,
            },
        });
    }
    async update(id, dto) {
        const data = { ...dto };
        if (dto.slug)
            data.slug = (0, slugify_1.toSlug)(dto.slug);
        if (dto.categoryId !== undefined)
            data.categoryId = Number(dto.categoryId);
        if (dto.tags)
            data.tagsJson = JSON.stringify(dto.tags);
        return this.prisma.blog.update({ where: { id: Number(id) }, data });
    }
    async delete(id) {
        return this.prisma.blog.delete({ where: { id: Number(id) } });
    }
};
exports.BlogsService = BlogsService;
exports.BlogsService = BlogsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], BlogsService);
//# sourceMappingURL=blogs.service.js.map
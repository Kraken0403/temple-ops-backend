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
exports.PoojaCategoryService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma.service");
let PoojaCategoryService = class PoojaCategoryService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async ensureSlugUniqueOrThrow(slug, ignoreId) {
        const existing = await this.prisma.poojaCategory.findUnique({ where: { slug } });
        if (existing && existing.id !== ignoreId) {
            throw new common_1.BadRequestException('Slug must be unique');
        }
    }
    slugify(s) {
        return (s || '')
            .toString()
            .trim()
            .toLowerCase()
            .replace(/&/g, ' and ')
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-+|-+$/g, '');
    }
    async ensureExists(id) {
        const cat = await this.prisma.poojaCategory.findUnique({ where: { id } });
        if (!cat)
            throw new common_1.NotFoundException('Category not found');
        return cat;
    }
    async create(dto) {
        if (!dto?.name?.trim())
            throw new common_1.BadRequestException('Name is required');
        const name = dto.name.trim();
        const slug = (dto.slug?.trim() || this.slugify(name));
        await this.ensureSlugUniqueOrThrow(slug);
        return this.prisma.poojaCategory.create({
            data: {
                name,
                slug,
                description: dto.description?.trim() || null,
                isActive: dto.isActive ?? true,
            },
        });
    }
    findAll() {
        return this.prisma.poojaCategory.findMany({
            orderBy: { name: 'asc' },
            include: { poojas: { select: { id: true, name: true } } },
        });
    }
    findOne(id) {
        return this.prisma.poojaCategory.findUnique({
            where: { id },
            include: { poojas: { select: { id: true, name: true } } },
        });
    }
    async update(id, dto) {
        await this.ensureExists(id);
        const data = {};
        if (dto.name !== undefined)
            data.name = dto.name.trim();
        if (dto.description !== undefined)
            data.description = dto.description?.trim() || null;
        if (dto.isActive !== undefined)
            data.isActive = !!dto.isActive;
        if (dto.slug !== undefined) {
            const slug = (dto.slug?.trim() || this.slugify(dto.name || ''));
            await this.ensureSlugUniqueOrThrow(slug, id);
            data.slug = slug;
        }
        return this.prisma.poojaCategory.update({ where: { id }, data });
    }
    async remove(id) {
        // (Optional) enforce “no poojas linked” before delete:
        const withCount = await this.prisma.poojaCategory.findUnique({
            where: { id },
            include: { _count: { select: { poojas: true } } },
        });
        if (!withCount)
            throw new common_1.NotFoundException('Category not found');
        if (withCount._count.poojas > 0) {
            throw new common_1.BadRequestException('Cannot delete: category is linked to one or more poojas');
        }
        return this.prisma.poojaCategory.delete({ where: { id } });
    }
};
exports.PoojaCategoryService = PoojaCategoryService;
exports.PoojaCategoryService = PoojaCategoryService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], PoojaCategoryService);
//# sourceMappingURL=pooja-category.service.js.map
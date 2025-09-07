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
exports.AlbumsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma.service");
function toSlug(s) {
    const base = (s || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    return base || 'album';
}
let AlbumsService = class AlbumsService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async uniqueSlug(base, excludeId) {
        const raw = toSlug(base);
        let slug = raw, i = 1;
        // eslint-disable-next-line no-constant-condition
        while (true) {
            const found = await this.prisma.album.findFirst({
                where: { slug, ...(excludeId ? { id: { not: excludeId } } : {}) },
                select: { id: true },
            });
            if (!found)
                return slug;
            slug = `${raw}-${i++}`;
        }
    }
    async list({ q = '', page = 1, pageSize = 24 }) {
        const where = q ? {
            OR: [
                { title: { contains: q, mode: 'insensitive' } },
                { description: { contains: q, mode: 'insensitive' } },
            ],
        } : {};
        const skip = (Number(page) - 1) * Number(pageSize);
        const take = Number(pageSize);
        const [items, total] = await this.prisma.$transaction([
            this.prisma.album.findMany({
                where, orderBy: { updatedAt: 'desc' }, skip, take,
                include: { cover: true, _count: { select: { items: true } } },
            }),
            this.prisma.album.count({ where }),
        ]);
        return { items, total, page: Number(page), pageSize: Number(pageSize), pages: Math.ceil(total / Number(pageSize)) };
    }
    async bySlug(slug) {
        const album = await this.prisma.album.findUnique({
            where: { slug },
            include: {
                cover: true,
                items: { orderBy: [{ sortOrder: 'asc' }, { id: 'asc' }], include: { media: true } },
            },
        });
        if (!album)
            throw new common_1.NotFoundException('Album not found');
        return album;
    }
    async create(dto) {
        const slug = await this.uniqueSlug(dto.slug || dto.title);
        if (dto.coverId) {
            const exists = await this.prisma.mediaAsset.findUnique({ where: { id: dto.coverId } });
            if (!exists)
                throw new common_1.BadRequestException('coverId is invalid');
        }
        return this.prisma.album.create({
            data: {
                title: dto.title,
                slug,
                description: dto.description,
                isPublic: dto.isPublic ?? true,
                coverId: dto.coverId ?? null,
            },
        });
    }
    async update(id, dto) {
        const album = await this.prisma.album.findUnique({ where: { id } });
        if (!album)
            throw new common_1.NotFoundException('Album not found');
        const data = {};
        if (dto.title !== undefined)
            data.title = dto.title;
        if (dto.description !== undefined)
            data.description = dto.description;
        if (dto.isPublic !== undefined)
            data.isPublic = dto.isPublic;
        if (dto.coverId !== undefined) {
            if (dto.coverId === null)
                data.coverId = null;
            else {
                const exists = await this.prisma.mediaAsset.findUnique({ where: { id: dto.coverId } });
                if (!exists)
                    throw new common_1.BadRequestException('coverId is invalid');
                data.coverId = dto.coverId;
            }
        }
        if (dto.slug)
            data.slug = await this.uniqueSlug(dto.slug, id);
        else if (dto.title)
            data.slug = await this.uniqueSlug(dto.title, id);
        return this.prisma.album.update({ where: { id }, data });
    }
    async remove(id) {
        await this.prisma.album.delete({ where: { id } }); // AlbumItem rows cascade
        return { ok: true };
    }
    async addItems(albumId, mediaIds) {
        if (!mediaIds?.length)
            throw new common_1.BadRequestException('mediaIds required');
        const album = await this.prisma.album.findUnique({ where: { id: albumId } });
        if (!album)
            throw new common_1.NotFoundException('Album not found');
        const last = await this.prisma.albumItem.findFirst({
            where: { albumId }, orderBy: { sortOrder: 'desc' }, select: { sortOrder: true },
        });
        let nextOrder = (last?.sortOrder ?? -1) + 1;
        const data = mediaIds.map((mediaId) => ({ albumId, mediaId, sortOrder: nextOrder++ }));
        await this.prisma.albumItem.createMany({ data, skipDuplicates: true });
        return this.bySlug(album.slug);
    }
    async reorder(albumId, order) {
        if (!order?.length)
            return { ok: true };
        const album = await this.prisma.album.findUnique({ where: { id: albumId } });
        if (!album)
            throw new common_1.NotFoundException('Album not found');
        await this.prisma.$transaction(order.map((o) => this.prisma.albumItem.update({ where: { id: o.itemId }, data: { sortOrder: o.sortOrder } })));
        return { ok: true };
    }
    async removeItem(albumId, itemId) {
        const item = await this.prisma.albumItem.findUnique({ where: { id: itemId } });
        if (!item || item.albumId !== albumId)
            throw new common_1.NotFoundException('Item not found');
        await this.prisma.albumItem.delete({ where: { id: itemId } });
        return { ok: true };
    }
};
exports.AlbumsService = AlbumsService;
exports.AlbumsService = AlbumsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], AlbumsService);
//# sourceMappingURL=albums.service.js.map
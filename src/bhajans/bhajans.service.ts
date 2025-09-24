import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { CreateBhajanDto } from './dto/create-bhajan.dto';
import { UpdateBhajanDto } from './dto/update-bhajan.dto';
import { toSlug } from '../common/validators/slugify';

@Injectable()
export class BhajansService {
  constructor(private prisma: PrismaService) {}

  // bhajans.service.ts

  
    async remove(id: number) {
        try {
        return await this.prisma.bhajan.delete({ where: { id: Number(id) } });
        } catch (e: any) {
        // Prisma P2025 = record not found
        if (e?.code === 'P2025') throw new NotFoundException('Bhajan not found');
        throw e;
        }
    }

    async findAll(params: {
        search?: string; language?: string; tag?: string;
        categoryId?: number; page?: number; limit?: number; publishedOnly?: boolean;
    }) {
        let { search, language, tag, categoryId, page, limit, publishedOnly = true } = params;
    
        const num = (v: any, def: number, { min = 1, max = 500 } = {}) => {
        const n = Number(v);
        if (!Number.isFinite(n)) return def;
        const i = Math.trunc(n);
        return Math.max(min, Math.min(max, i));
        };
    
        const _page  = num(page, 1, { min: 1, max: 1_000_000 });
        const _limit = num(limit, 12, { min: 1, max: 200 });
    
        const where: any = {};
        if (publishedOnly) where.isPublished = true;
        if (language) where.language = language;
        if (categoryId != null && Number.isFinite(categoryId)) where.categoryId = Number(categoryId);
        if (search) where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { lyricsHtml: { contains: search, mode: 'insensitive' } },
        ];
        if (tag) where.tagsJson = { contains: `"${tag}"` };
    
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
  

  async findBySlug(slug: string) {
    const bhajan = await this.prisma.bhajan.findUnique({ where: { slug } });
    if (!bhajan) throw new NotFoundException('Bhajan not found');
    // increment views (fire and forget)
    this.prisma.bhajan.update({
      where: { id: bhajan.id }, data: { viewsCount: { increment: 1 } }
    }).catch(() => {});
    return bhajan;
  }

  async create(dto: CreateBhajanDto) {
    const slug = dto.slug ? toSlug(dto.slug) : toSlug(dto.title);
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
    async update(id: number, dto: UpdateBhajanDto) {
        const norm = (s?: string) => (s && s.trim() ? s.trim() : null)
    
        const data: any = {
        // only include keys that exist in the Prisma model
        title: dto.title !== undefined ? norm(dto.title) : undefined,
        pdfUrl: dto.pdfUrl !== undefined ? norm(dto.pdfUrl) : undefined,
        lyricsHtml: dto.lyricsHtml !== undefined ? norm(dto.lyricsHtml) : undefined,
        audioUrl: dto.audioUrl !== undefined ? norm(dto.audioUrl) : undefined,
        thumbnailUrl: dto.thumbnailUrl !== undefined ? norm(dto.thumbnailUrl) : undefined,
        isPublished: dto.isPublished, // boolean or undefined is fine
        }
    
        if (dto.slug !== undefined) data.slug = dto.slug ? toSlug(dto.slug) : undefined
        if (dto.language !== undefined) data.language = norm(dto.language) // if you still keep it in schema
        if (dto.categoryId !== undefined) data.categoryId = dto.categoryId ? Number(dto.categoryId) : null
        if (dto.tags !== undefined) data.tagsJson = dto.tags && dto.tags.length ? JSON.stringify(dto.tags) : null
    
        // remove undefined so Prisma only updates provided fields
        Object.keys(data).forEach((k) => data[k] === undefined && delete data[k])
    
        return this.prisma.bhajan.update({
        where: { id: Number(id) },
        data,
        })
    }
  
}

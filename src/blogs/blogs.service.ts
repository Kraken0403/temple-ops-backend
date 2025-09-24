import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { CreateBlogDto } from './dto/create-blog.dto';
import { UpdateBlogDto } from './dto/update-blog.dto';
import { toSlug } from '../common/validators/slugify';

@Injectable()
export class BlogsService {
  constructor(private prisma: PrismaService) {}

  async findAll(params: { search?: string; tag?: string; categoryId?: number; page?: number; limit?: number; publishedOnly?: boolean; }) {
    const { search, tag, categoryId, page = 1, limit = 12, publishedOnly = true } = params;
    const where: any = {};
    if (publishedOnly) where.isPublished = true;
    if (categoryId) where.categoryId = Number(categoryId);
    if (search) where.OR = [
      { title: { contains: search, mode: 'insensitive' } },
      { excerpt: { contains: search, mode: 'insensitive' } },
      { bodyHtml: { contains: search, mode: 'insensitive' } },
    ];
    if (tag) where.tagsJson = { contains: `"${tag}"` };

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

  async findBySlug(slug: string) {
    const blog = await this.prisma.blog.findUnique({ where: { slug } });
    if (!blog) throw new NotFoundException('Blog not found');
    return blog;
  }

  async create(dto: CreateBlogDto) {
    const slug = dto.slug ? toSlug(dto.slug) : toSlug(dto.title);
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

  async update(id: number, dto: UpdateBlogDto) {
    const data: any = { ...dto };
    if (dto.slug) data.slug = toSlug(dto.slug);
    if (dto.categoryId !== undefined) data.categoryId = Number(dto.categoryId);
    if (dto.tags) data.tagsJson = JSON.stringify(dto.tags);
    return this.prisma.blog.update({ where: { id: Number(id) }, data });
  }

  async delete(id: number) {
    return this.prisma.blog.delete({ where: { id: Number(id) } });
  }
}

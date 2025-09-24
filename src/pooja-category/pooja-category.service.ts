import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common'
import { PrismaService } from '../prisma.service'

@Injectable()
export class PoojaCategoryService {
  constructor(private readonly prisma: PrismaService) {}

  private async ensureSlugUniqueOrThrow(slug: string, ignoreId?: number) {
    const existing = await this.prisma.poojaCategory.findUnique({ where: { slug } })
    if (existing && existing.id !== ignoreId) {
      throw new BadRequestException('Slug must be unique')
    }
  }

  private slugify(s: string) {
    return (s || '')
      .toString()
      .trim()
      .toLowerCase()
      .replace(/&/g, ' and ')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
  }

  async ensureExists(id: number) {
    const cat = await this.prisma.poojaCategory.findUnique({ where: { id } })
    if (!cat) throw new NotFoundException('Category not found')
    return cat
  }

  async create(dto: { name: string; slug?: string; description?: string; isActive?: boolean }) {
    if (!dto?.name?.trim()) throw new BadRequestException('Name is required')
    const name = dto.name.trim()
    const slug = (dto.slug?.trim() || this.slugify(name))
    await this.ensureSlugUniqueOrThrow(slug)

    return this.prisma.poojaCategory.create({
      data: {
        name,
        slug,
        description: dto.description?.trim() || null,
        isActive: dto.isActive ?? true,
      },
    })
  }

  findAll() {
    return this.prisma.poojaCategory.findMany({
      orderBy: { name: 'asc' },
      include: { poojas: { select: { id: true, name: true } } },
    })
  }

  findOne(id: number) {
    return this.prisma.poojaCategory.findUnique({
      where: { id },
      include: { poojas: { select: { id: true, name: true } } },
    })
  }

  async update(
    id: number,
    dto: Partial<{ name: string; slug: string; description?: string; isActive?: boolean }>
  ) {
    await this.ensureExists(id)

    const data: any = {}
    if (dto.name !== undefined) data.name = dto.name.trim()
    if (dto.description !== undefined) data.description = dto.description?.trim() || null
    if (dto.isActive !== undefined) data.isActive = !!dto.isActive

    if (dto.slug !== undefined) {
      const slug = (dto.slug?.trim() || this.slugify(dto.name || ''))
      await this.ensureSlugUniqueOrThrow(slug, id)
      data.slug = slug
    }

    return this.prisma.poojaCategory.update({ where: { id }, data })
  }

  async remove(id: number) {
    // (Optional) enforce “no poojas linked” before delete:
    const withCount = await this.prisma.poojaCategory.findUnique({
      where: { id },
      include: { _count: { select: { poojas: true } } },
    })
    if (!withCount) throw new NotFoundException('Category not found')
    if (withCount._count.poojas > 0) {
      throw new BadRequestException('Cannot delete: category is linked to one or more poojas')
    }

    return this.prisma.poojaCategory.delete({ where: { id } })
  }
}

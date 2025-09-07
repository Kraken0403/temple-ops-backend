import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common'
import { PrismaService } from '../prisma.service'
import { CreateAlbumDto } from './dtos/create-album.dto'
import { UpdateAlbumDto } from './dtos/update-album.dto'
import { ListQueryDto } from '../shared/dtos/list-query.dto'

function toSlug(s: string) {
  const base = (s || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
  return base || 'album'
}

@Injectable()
export class AlbumsService {
  constructor(private prisma: PrismaService) {}

  private async uniqueSlug(base: string, excludeId?: number) {
    const raw = toSlug(base)
    let slug = raw, i = 1
    // eslint-disable-next-line no-constant-condition
    while (true) {
      const found = await this.prisma.album.findFirst({
        where: { slug, ...(excludeId ? { id: { not: excludeId } } : {}) },
        select: { id: true },
      })
      if (!found) return slug
      slug = `${raw}-${i++}`
    }
  }

  async list({ q = '', page = 1, pageSize = 24 }: ListQueryDto) {
    const where = q ? {
      OR: [
        { title: { contains: q, mode: 'insensitive' } },
        { description: { contains: q, mode: 'insensitive' } },
      ],
    } : {}

    const skip = (Number(page) - 1) * Number(pageSize)
    const take = Number(pageSize)

    const [items, total] = await this.prisma.$transaction([
      this.prisma.album.findMany({
        where, orderBy: { updatedAt: 'desc' }, skip, take,
        include: { cover: true, _count: { select: { items: true } } },
      }),
      this.prisma.album.count({ where }),
    ])
    return { items, total, page: Number(page), pageSize: Number(pageSize), pages: Math.ceil(total / Number(pageSize)) }
  }

  async bySlug(slug: string) {
    const album = await this.prisma.album.findUnique({
      where: { slug },
      include: {
        cover: true,
        items: { orderBy: [{ sortOrder: 'asc' }, { id: 'asc' }], include: { media: true } },
      },
    })
    if (!album) throw new NotFoundException('Album not found')
    return album
  }

  async create(dto: CreateAlbumDto) {
    const slug = await this.uniqueSlug(dto.slug || dto.title)
    if (dto.coverId) {
      const exists = await this.prisma.mediaAsset.findUnique({ where: { id: dto.coverId } })
      if (!exists) throw new BadRequestException('coverId is invalid')
    }
    return this.prisma.album.create({
      data: {
        title: dto.title,
        slug,
        description: dto.description,
        isPublic: dto.isPublic ?? true,
        coverId: dto.coverId ?? null,
      },
    })
  }

  async update(id: number, dto: UpdateAlbumDto) {
    const album = await this.prisma.album.findUnique({ where: { id } })
    if (!album) throw new NotFoundException('Album not found')

    const data: any = {}
    if (dto.title !== undefined) data.title = dto.title
    if (dto.description !== undefined) data.description = dto.description
    if (dto.isPublic !== undefined) data.isPublic = dto.isPublic
    if (dto.coverId !== undefined) {
      if (dto.coverId === null as any) data.coverId = null
      else {
        const exists = await this.prisma.mediaAsset.findUnique({ where: { id: dto.coverId } })
        if (!exists) throw new BadRequestException('coverId is invalid')
        data.coverId = dto.coverId
      }
    }
    if (dto.slug) data.slug = await this.uniqueSlug(dto.slug, id)
    else if (dto.title) data.slug = await this.uniqueSlug(dto.title, id)

    return this.prisma.album.update({ where: { id }, data })
  }

  async remove(id: number) {
    await this.prisma.album.delete({ where: { id } }) // AlbumItem rows cascade
    return { ok: true }
  }

  async addItems(albumId: number, mediaIds: number[]) {
    if (!mediaIds?.length) throw new BadRequestException('mediaIds required')
    const album = await this.prisma.album.findUnique({ where: { id: albumId } })
    if (!album) throw new NotFoundException('Album not found')

    const last = await this.prisma.albumItem.findFirst({
      where: { albumId }, orderBy: { sortOrder: 'desc' }, select: { sortOrder: true },
    })
    let nextOrder = (last?.sortOrder ?? -1) + 1
    const data = mediaIds.map((mediaId) => ({ albumId, mediaId, sortOrder: nextOrder++ }))

    await this.prisma.albumItem.createMany({ data, skipDuplicates: true })
    return this.bySlug(album.slug)
  }

  async reorder(albumId: number, order: { itemId: number; sortOrder: number }[]) {
    if (!order?.length) return { ok: true }
    const album = await this.prisma.album.findUnique({ where: { id: albumId } })
    if (!album) throw new NotFoundException('Album not found')

    await this.prisma.$transaction(
      order.map((o) =>
        this.prisma.albumItem.update({ where: { id: o.itemId }, data: { sortOrder: o.sortOrder } }),
      ),
    )
    return { ok: true }
  }

  async removeItem(albumId: number, itemId: number) {
    const item = await this.prisma.albumItem.findUnique({ where: { id: itemId } })
    if (!item || item.albumId !== albumId) throw new NotFoundException('Item not found')
    await this.prisma.albumItem.delete({ where: { id: itemId } })
    return { ok: true }
  }
}

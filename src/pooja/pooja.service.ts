import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common'
import { PrismaService } from '../prisma.service'
import { CreatePoojaJsonDto } from './dto/create-pooja-json.dto'
import { UpdatePoojaDto } from './dto/update-pooja.dto'

@Injectable()
export class PoojaService {
  constructor(private readonly prisma: PrismaService) {}

  /** List all (non-archived) poojas */
  findAll() {
    return this.prisma.pooja.findMany({
      where: { deletedAt: null },
      orderBy: { updatedAt: 'desc' },
      include: {
        priests: true,
        bookings: true,
        featuredMedia: true,
        categories: true,
        venue: true,
        gallery: { include: { media: true }, orderBy: { sortOrder: 'asc' } },
      }
    })
  }

  /** Get one by ID (allows archived too for detail pages/history) */
  findOne(id: number) {
    return this.prisma.pooja.findUnique({
      where: { id },
      include: {
        priests: true,
        bookings: true,
        featuredMedia: true,
        categories: true,
        venue: true,
        gallery: { include: { media: true }, orderBy: { sortOrder: 'asc' } },
      }
    })
  }

  /** Create using pure JSON */
  async createFromJson(dto: CreatePoojaJsonDto) {
    const {
      name, priestIds, categoryIds,
      amount, outsideAmount,
      durationMin, prepTimeMin, bufferMin,
      isInVenue, isOutsideVenue, date, time,
      venueId, venueAddress, mapLink,
      allowedZones, includeFood, includeHall,
      materials, notes, description,
      featuredMediaId, clearFeaturedMedia,
    } = dto;

    // ✅ VALIDATION: outside amount rules
    if (isOutsideVenue && outsideAmount == null) {
      throw new BadRequestException(
        'outsideAmount is required when isOutsideVenue = true'
      )
    }

    if (!isOutsideVenue && outsideAmount != null) {
      throw new BadRequestException(
        'outsideAmount should not be provided when isOutsideVenue = false'
      )
    }

    const data: any = {
      name,
      amount,
      outsideAmount: outsideAmount ?? null,

      durationMin,
      prepTimeMin,
      bufferMin,
      isInVenue,
      isOutsideVenue,

      ...(date ? { date: new Date(date) } : {}),
      ...(time ? { time: new Date(time) } : {}),

      ...(typeof venueId === 'number'
        ? { venue: { connect: { id: venueId } } }
        : {}),

      venueAddress: venueAddress ?? null,
      mapLink:      mapLink      ?? null,

      ...(allowedZones !== undefined ? { allowedZones } : {}),

      includeFood:  includeFood  ?? false,
      includeHall:  includeHall  ?? false,
      materials:    materials    ?? null,
      notes:        notes        ?? null,
      description:  description  ?? null,

      priests: { connect: (priestIds ?? []).map(id => ({ id })) },
      ...(categoryIds?.length
        ? { categories: { connect: categoryIds.map(id => ({ id })) } }
        : {}),
    };

    if (!clearFeaturedMedia && typeof featuredMediaId === 'number') {
      data.featuredMedia = { connect: { id: featuredMediaId } };
    }

    return this.prisma.pooja.create({
      data,
      include: {
        featuredMedia: true,
        categories: true,
        venue: true,
        gallery: { include: { media: true }, orderBy: { sortOrder: 'asc' } },
        priests: true,
        bookings: true,
      },
    });
  }

  /** Update using pure JSON */
  async updateFromJson(id: number, dto: UpdatePoojaDto) {
    await this.ensureExists(id)
    console.log('DTO outsideAmount:', dto.outsideAmount)

    const data: any = {}

    if (dto.name           !== undefined) data.name           = dto.name
    if (dto.amount         !== undefined) data.amount         = dto.amount
    if ((dto as any).outsideAmount !== undefined)
      data.outsideAmount = (dto as any).outsideAmount ?? null

    if (dto.durationMin    !== undefined) data.durationMin    = dto.durationMin
    if (dto.prepTimeMin    !== undefined) data.prepTimeMin    = dto.prepTimeMin
    if (dto.bufferMin      !== undefined) data.bufferMin      = dto.bufferMin
    if (dto.isInVenue      !== undefined) data.isInVenue      = dto.isInVenue
    if (dto.isOutsideVenue !== undefined) data.isOutsideVenue = dto.isOutsideVenue

    // ✅ VALIDATION ON UPDATE (only when relevant fields provided)


    if (
      dto.isOutsideVenue === true &&
      Object.prototype.hasOwnProperty.call(dto, 'outsideAmount') &&
      dto.outsideAmount === null
    ) {
      throw new BadRequestException(
        'outsideAmount is required when isOutsideVenue = true'
      )
    }

    if (
      dto.isOutsideVenue === false &&
      Object.prototype.hasOwnProperty.call(dto, 'outsideAmount')
    ) {
      throw new BadRequestException(
        'outsideAmount should not be provided when isOutsideVenue = false'
      )
    }


    if (dto.date !== undefined) data.date = dto.date ? new Date(dto.date) : null
    if (dto.time !== undefined) data.time = dto.time ? new Date(dto.time) : null

    if ((dto as any).venueId !== undefined) {
      const v = (dto as any).venueId
      if (v === null) {
        data.venue = { disconnect: true }
      } else if (typeof v === 'number') {
        data.venue = { connect: { id: v } }
      }
    }

    if (dto.venueAddress !== undefined) data.venueAddress = dto.venueAddress ?? null
    if (dto.mapLink      !== undefined) data.mapLink      = dto.mapLink ?? null

    if (dto.allowedZones !== undefined) data.allowedZones = dto.allowedZones

    if (dto.includeFood  !== undefined) data.includeFood  = dto.includeFood
    if (dto.includeHall  !== undefined) data.includeHall  = dto.includeHall
    if (dto.materials    !== undefined) data.materials    = dto.materials ?? null
    if (dto.notes        !== undefined) data.notes        = dto.notes ?? null
    if (dto.description  !== undefined) data.description  = dto.description ?? null

    if (dto.priestIds !== undefined) {
      data.priests = { set: (dto.priestIds ?? []).map(i => ({ id: i })) }
    }

    if ((dto as any).categoryIds !== undefined) {
      const ids: number[] =
        ((dto as any).categoryIds ?? [])
          .map(Number)
          .filter((n: number) => Number.isFinite(n))
      data.categories = { set: ids.map(id => ({ id })) }
    }

    if ((dto as any).clearFeaturedMedia) {
      data.featuredMedia = { disconnect: true }
    } else if (typeof (dto as any).featuredMediaId === 'number') {
      data.featuredMedia = { connect: { id: (dto as any).featuredMediaId } }
    }

    return this.prisma.pooja.update({
      where: { id },
      data,
      include: {
        featuredMedia: true,
        categories: true,
        venue: true,
        gallery: { include: { media: true }, orderBy: { sortOrder: 'asc' } },
        priests: true,
        bookings: true,
      }
    })
  }

  /** Delete (soft / hard) */
  async remove(id: number, force = false) {
    const pooja = await this.prisma.pooja.findUnique({
      where: { id },
      include: { bookings: { select: { id: true } } }
    })
    if (!pooja) throw new NotFoundException('Pooja not found')

    if (force) {
      if (pooja.bookings.length > 0) {
        throw new BadRequestException(
          'Cannot hard delete: bookings exist. The pooja has been kept to preserve booking history.'
        )
      }
      return this.prisma.$transaction(async (tx) => {
        await tx.pooja.update({
          where: { id },
          data: { priests: { set: [] }, categories: { set: [] } }
        })
        await tx.poojaMedia.deleteMany({ where: { poojaId: id } })
        return tx.pooja.delete({ where: { id } })
      })
    }

    return this.prisma.pooja.update({
      where: { id },
      data: { deletedAt: new Date() }
    })
  }

  // ---- Media picker utilities ----

  async setFeaturedMedia(poojaId: number, mediaId: number | null) {
    await this.ensureExists(poojaId)
    if (mediaId) {
      const exists = await this.prisma.mediaAsset.count({ where: { id: mediaId } })
      if (!exists) throw new BadRequestException('mediaId not found')
    }
    return this.prisma.pooja.update({
      where: { id: poojaId },
      data: { featuredMediaId: mediaId },
      include: {
        featuredMedia: true,
        categories: true,
        venue: true,
        gallery: { include: { media: true }, orderBy: { sortOrder: 'asc' } },
      },
    })
  }

  async addToGallery(poojaId: number, mediaIds: number[]) {
    await this.ensureExists(poojaId)
    if (!mediaIds?.length) return { ok: true }
    const ids = [...new Set(mediaIds)]
    const count = await this.prisma.mediaAsset.count({ where: { id: { in: ids } } })
    if (count !== ids.length) throw new BadRequestException('Some mediaIds do not exist')

    const max = await this.prisma.poojaMedia.aggregate({
      where: { poojaId },
      _max: { sortOrder: true },
    })
    let start = (max._max.sortOrder ?? -1) + 1

    await this.prisma.poojaMedia.createMany({
      data: ids.map(mid => ({ poojaId, mediaId: mid, sortOrder: start++ })),
      skipDuplicates: true,
    })

    return this.prisma.pooja.findUnique({
      where: { id: poojaId },
      include: { gallery: { include: { media: true }, orderBy: { sortOrder: 'asc' } } },
    })
  }

  async reorderGallery(poojaId: number, orders: { mediaId: number; sortOrder: number }[]) {
    await this.ensureExists(poojaId)
    await this.prisma.poojaMedia.deleteMany({ where: { poojaId } })
    const data = (orders ?? [])
      .slice()
      .sort((a, b) => a.sortOrder - b.sortOrder)
      .map((o, i) => ({ poojaId, mediaId: o.mediaId, sortOrder: i }))
    if (data.length) await this.prisma.poojaMedia.createMany({ data })
    return { ok: true }
  }

  async removeFromGallery(poojaId: number, mediaId: number) {
    await this.ensureExists(poojaId)
    await this.prisma.poojaMedia.deleteMany({ where: { poojaId, mediaId } })
    return { ok: true }
  }

  private async ensureExists(id: number) {
    const exists = await this.prisma.pooja.count({ where: { id } })
    if (!exists) throw new NotFoundException('Pooja not found')
  }
}

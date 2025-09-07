// src/pooja/pooja.service.ts
import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common'
import { PrismaService } from '../prisma.service'
import { CreatePoojaJsonDto } from './dto/create-pooja-json.dto'
import { UpdatePoojaDto } from './dto/update-pooja.dto'
import * as fs from 'fs'
import * as path from 'path'

@Injectable()
export class PoojaService {
  constructor(private readonly prisma: PrismaService) {}

  /** Save an uploaded file and return its public URL */
  async savePhotoAndGetUrl(file: Express.Multer.File): Promise<string> {
    const uploadsDir = path.join(__dirname, '..', '..', 'uploads')

    if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir)

    const fileName = Date.now() + '-' + file.originalname.replace(/\s+/g, '_')
    const filePath = path.join(uploadsDir, fileName)
    fs.writeFileSync(filePath, file.buffer)

    // Return public URL — adjust according to your static file serving setup
    return `/uploads/${fileName}`
  }

  /** List all (non-archived) poojas */
  findAll() {
    return this.prisma.pooja.findMany({
      where: { deletedAt: null },               // ⬅️ hide archived poojas
      include: { priests: true, bookings: true }
    })
  }

  /** Get one by ID (allows archived too for detail pages/history) */
  findOne(id: number) {
    return this.prisma.pooja.findUnique({
      where: { id },
      include: { priests: true, bookings: true }
    })
  }

  /** Create using pure JSON */
  async createFromJson(dto: CreatePoojaJsonDto) {
    const {
      name,
      priestIds,
      amount,
      durationMin,
      prepTimeMin,
      bufferMin,
      isInVenue,
      isOutsideVenue,
      date,
      time,
      venueAddress,
      mapLink,
      allowedZones,
      includeFood,
      includeHall,
      materials,
      notes,
      photoUrl
    } = dto

    return this.prisma.pooja.create({
      data: {
        name,
        amount,
        durationMin,
        prepTimeMin,
        bufferMin,
        isInVenue,
        isOutsideVenue,

        ...(date ? { date: new Date(date) } : {}),
        ...(time ? { time: new Date(time) } : {}),

        venueAddress: venueAddress ?? null,
        mapLink:      mapLink      ?? null,

        ...(allowedZones !== undefined ? { allowedZones } : {}),

        includeFood:  includeFood  ?? false,
        includeHall:  includeHall  ?? false,
        materials:    materials    ?? null,
        notes:        notes        ?? null,
        photoUrl:     photoUrl     ?? null,

        priests: {
          connect: priestIds.map(id => ({ id }))
        }
      }
    })
  }

  /** Update using pure JSON */
  async updateFromJson(id: number, dto: UpdatePoojaDto) {
    const data: any = {}

    if (dto.name           !== undefined) data.name           = dto.name
    if (dto.amount         !== undefined) data.amount         = dto.amount

    if (dto.durationMin    !== undefined) data.durationMin    = dto.durationMin
    if (dto.prepTimeMin    !== undefined) data.prepTimeMin    = dto.prepTimeMin
    if (dto.bufferMin      !== undefined) data.bufferMin      = dto.bufferMin
    if (dto.isInVenue      !== undefined) data.isInVenue      = dto.isInVenue
    if (dto.isOutsideVenue !== undefined) data.isOutsideVenue = dto.isOutsideVenue

    if (dto.date !== undefined) {
      data.date = dto.date ? new Date(dto.date) : null
    }
    if (dto.time !== undefined) {
      data.time = dto.time ? new Date(dto.time) : null
    }

    if (dto.venueAddress !== undefined) data.venueAddress = dto.venueAddress
    if (dto.mapLink      !== undefined) data.mapLink      = dto.mapLink

    if (dto.allowedZones !== undefined) data.allowedZones = dto.allowedZones

    if (dto.includeFood  !== undefined) data.includeFood  = dto.includeFood
    if (dto.includeHall  !== undefined) data.includeHall  = dto.includeHall
    if (dto.materials    !== undefined) data.materials    = dto.materials
    if (dto.notes        !== undefined) data.notes        = dto.notes
    if (dto.photoUrl     !== undefined) data.photoUrl     = dto.photoUrl

    if (dto.priestIds !== undefined) {
      data.priests = { set: dto.priestIds.map(i => ({ id: i })) }
    }

    return this.prisma.pooja.update({
      where: { id },
      data
    })
  }

  /**
   * Delete a pooja
   * - Default: SOFT DELETE (archive) → sets deletedAt, bookings remain intact
   * - Hard delete (`force=true`): only allowed if there are NO bookings
   */
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
      // Hard delete with cleanup
      return this.prisma.$transaction(async (tx) => {
        await tx.pooja.update({ where: { id }, data: { priests: { set: [] } } })
        return tx.pooja.delete({ where: { id } })
      })
    }

    // Soft delete (archive). Bookings stay exactly as-is.
    return this.prisma.pooja.update({
      where: { id },
      data: { deletedAt: new Date() }
    })
  }
}

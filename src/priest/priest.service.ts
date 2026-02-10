// src/priest/priest.service.ts
import { Injectable, BadRequestException } from '@nestjs/common'
import { PrismaService } from '../prisma.service'
import { CreatePriestDto } from './dto/create-priest.dto'
import { UpdatePriestDto } from './dto/update-priest.dto'
import { CreateSlotDto } from './dto/create-slot.dto'
import { UpdateSlotDto } from './dto/update-slot.dto'
import { Prisma, SlotType } from '@prisma/client'
import { addMinutes, format } from 'date-fns'
import { TimezoneUtil } from '../common/timezone.util'

@Injectable()
export class PriestService {
  private tzUtil: TimezoneUtil

  constructor(private readonly prisma: PrismaService) {
    this.tzUtil = new TimezoneUtil(prisma)
  }

  // -------------------------------
  // Priest CRUD
  // -------------------------------

  async createPriest(dto: CreatePriestDto) {
    const data: Prisma.PriestCreateInput = {
      name: dto.name,
      specialty: dto.specialty ?? null,
      contactNo: dto.contactNo ?? null,
      email: dto.email ?? null,
      address: dto.address ?? null,
      languages: dto.languages ?? [],
      qualifications: dto.qualifications ?? [],
    }

    if (!dto.clearFeaturedMedia && typeof dto.featuredMediaId === 'number') {
      ;(data as any).featuredMedia = { connect: { id: dto.featuredMediaId } }
    }

    return this.prisma.priest.create({
      data,
      include: { featuredMedia: true },
    })
  }

  async getAllPriests() {
    const list = await this.prisma.priest.findMany({
      include: { slots: true, bookings: true, featuredMedia: true },
      orderBy: { id: 'desc' },
    })

    // Convert slots back to configured timezone
    return Promise.all(
      list.map(async p => ({
        ...p,
        slots: await Promise.all(
          p.slots.map(async s => ({
            ...s,
            start: await this.tzUtil.fromUTC(s.start),
            end: await this.tzUtil.fromUTC(s.end),
            date: s.date ? await this.tzUtil.fromUTC(s.date) : null,
          })),
        ),
      })),
    )
  }

  async getPriest(id: number) {
    const p = await this.prisma.priest.findUnique({
      where: { id },
      include: { slots: true, bookings: true, featuredMedia: true },
    })
    if (!p) return null

    return {
      ...p,
      slots: await Promise.all(
        p.slots.map(async s => ({
          ...s,
          start: await this.tzUtil.fromUTC(s.start),
          end: await this.tzUtil.fromUTC(s.end),
          date: s.date ? await this.tzUtil.fromUTC(s.date) : null,
        })),
      ),
    }
  }

  async updatePriest(id: number, dto: UpdatePriestDto) {
    const data: Prisma.PriestUpdateInput = {
      ...(dto.name !== undefined && { name: dto.name }),
      ...(dto.specialty !== undefined && { specialty: dto.specialty }),
      ...(dto.contactNo !== undefined && { contactNo: dto.contactNo }),
      ...(dto.email !== undefined && { email: dto.email }),
      ...(dto.address !== undefined && { address: dto.address }),
      ...(dto.languages !== undefined && { languages: dto.languages }),
      ...(dto.qualifications !== undefined && { qualifications: dto.qualifications }),
    }

    if (dto.clearFeaturedMedia) {
      Object.assign(data, { featuredMedia: { disconnect: true } })
    } else if (typeof dto.featuredMediaId === 'number') {
      Object.assign(data, { featuredMedia: { connect: { id: dto.featuredMediaId } } })
    }

    return this.prisma.priest.update({
      where: { id },
      data,
      include: { featuredMedia: true },
    })
  }

  async deletePriest(id: number) {
    return this.prisma.priest.delete({ where: { id } })
  }

  // -------------------------------
  // AvailabilitySlot CRUD
  // -------------------------------

  async createSlot(dto: CreateSlotDto) {
    const startUTC = await this.tzUtil.toUTC(dto.start)
    const endUTC = await this.tzUtil.toUTC(dto.end)
    const dateUTC = dto.date ? await this.tzUtil.toUTC(dto.date) : null

    if (!dto.disabled) {
      const overlap = await this.prisma.availabilitySlot.findFirst({
        where: {
          priestId: dto.priestId,
          disabled: false,
          start: { lte: endUTC },
          end: { gte: startUTC },
        },
      })
      if (overlap) throw new BadRequestException('Conflicting slot already exists.')
    }

    const created = await this.prisma.availabilitySlot.create({
      data: {
        priestId: dto.priestId,
        start: startUTC,
        end: endUTC,
        disabled: dto.disabled,
        type: dto.type,
        ...(dateUTC && { date: dateUTC }),
        ...(dto.daysOfWeek && { daysOfWeek: dto.daysOfWeek }),
      },
    })

    return {
      ...created,
      start: await this.tzUtil.fromUTC(created.start),
      end: await this.tzUtil.fromUTC(created.end),
      date: created.date ? await this.tzUtil.fromUTC(created.date) : null,
    }
  }

  async getSlotsForPriest(priestId: number) {
    const list = await this.prisma.availabilitySlot.findMany({ where: { priestId } })
    return Promise.all(
      list.map(async s => ({
        ...s,
        start: await this.tzUtil.fromUTC(s.start),
        end: await this.tzUtil.fromUTC(s.end),
        date: s.date ? await this.tzUtil.fromUTC(s.date) : null,
      })),
    )
  }

  async updateSlot(id: number, dto: UpdateSlotDto) {
    const data: Prisma.AvailabilitySlotUpdateInput = {
      ...(dto.priestId !== undefined && { priestId: dto.priestId }),
      ...(dto.start !== undefined && { start: await this.tzUtil.toUTC(dto.start) }),
      ...(dto.end !== undefined && { end: await this.tzUtil.toUTC(dto.end) }),
      ...(dto.disabled !== undefined && { disabled: dto.disabled }),
      ...(dto.type !== undefined && { type: dto.type }),
      ...(dto.daysOfWeek !== undefined && { daysOfWeek: dto.daysOfWeek }),
      ...(dto.date !== undefined && { date: await this.tzUtil.toUTC(dto.date) }),
    }

    const updated = await this.prisma.availabilitySlot.update({ where: { id }, data })
    return {
      ...updated,
      start: await this.tzUtil.fromUTC(updated.start),
      end: await this.tzUtil.fromUTC(updated.end),
      date: updated.date ? await this.tzUtil.fromUTC(updated.date) : null,
    }
  }

  async getSlotsForPriestInRange(priestId: number, from: Date, to: Date) {
    const list = await this.prisma.availabilitySlot.findMany({
      where: { priestId, start: { gte: from }, end: { lte: to } },
      orderBy: { start: 'asc' },
    })
    return Promise.all(
      list.map(async s => ({
        ...s,
        start: await this.tzUtil.fromUTC(s.start),
        end: await this.tzUtil.fromUTC(s.end),
        date: s.date ? await this.tzUtil.fromUTC(s.date) : null,
      })),
    )
  }

  async deleteSlot(id: number) {
    return this.prisma.availabilitySlot.delete({ where: { id } })
  }

  // -------------------------------
  // Availability finder
  // -------------------------------

  async getAvailableChunks(priestId: number, bookingDate: string, totalMinutes: number) {
    const dateObj = await this.tzUtil.toUTC(bookingDate) // interpret in configured TZ → UTC
    const weekdayShort = format(new Date(bookingDate), 'EEE') // still local label for recurring

    const availSlots = await this.prisma.availabilitySlot.findMany({
      where: { priestId, disabled: false, OR: [{ date: dateObj }, { date: null }] },
    })

    const busySlots = await this.prisma.availabilitySlot.findMany({
      where: { priestId, disabled: true, date: dateObj },
    })

    const validChunks: { start: Date; end: Date; priestId: number; type: SlotType }[] = []
    for (const slot of availSlots) {
      if (!slot.date) {
        const days: string[] = Array.isArray(slot.daysOfWeek)
          ? slot.daysOfWeek
          : typeof slot.daysOfWeek === 'string'
          ? JSON.parse(slot.daysOfWeek)
          : []
        if (!days.includes(weekdayShort)) continue
      }

      // reconstruct local-day slots from stored UTC times
      const start = new Date(bookingDate)
      start.setHours(slot.start.getUTCHours(), slot.start.getUTCMinutes(), 0, 0)

      const end = new Date(bookingDate)
      end.setHours(slot.end.getUTCHours(), slot.end.getUTCMinutes(), 0, 0)
      if (end <= start) end.setDate(end.getDate() + 1)

      const chunks = this.generateChunks(start, end, totalMinutes)
      validChunks.push(...chunks.map(c => ({ ...c, priestId: slot.priestId, type: slot.type })))
    }

    const busyRanges = busySlots.map(slot => {
      const bs = new Date(bookingDate)
      bs.setHours(slot.start.getUTCHours(), slot.start.getUTCMinutes(), 0, 0)
      const be = new Date(bookingDate)
      be.setHours(slot.end.getUTCHours(), slot.end.getUTCMinutes(), 0, 0)
      if (be <= bs) be.setDate(be.getDate() + 1)
      return { start: bs, end: be }
    })

    const existing = await this.prisma.booking.findMany({ where: { priestId, bookingDate: dateObj } })

    const available = validChunks.filter(
      chunk =>
        !existing.some(b => this.overlaps(chunk.start, chunk.end, b.start, b.end)) &&
        !busyRanges.some(b => this.overlaps(chunk.start, chunk.end, b.start, b.end)),
    )

    // Convert back to timezone strings for frontend
    return Promise.all(
      available.map(async c => ({
        ...c,
        start: await this.tzUtil.fromUTC(c.start),
        end: await this.tzUtil.fromUTC(c.end),
      })),
    )
  }

  private generateChunks(start: Date, end: Date, durationMin: number) {
    const chunks = []
    let current = new Date(start)
    while (addMinutes(current, durationMin) <= end) {
      const chunkEnd = addMinutes(current, durationMin)
      chunks.push({ start: new Date(current), end: chunkEnd })
      current = chunkEnd
    }
    return chunks
  }

  private overlaps(aStart: Date, aEnd: Date, bStart: Date, bEnd: Date) {
    return aStart < bEnd && aEnd > bStart
  }
}
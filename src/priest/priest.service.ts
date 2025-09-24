import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { CreatePriestDto } from './dto/create-priest.dto';
import { UpdatePriestDto } from './dto/update-priest.dto';
import { CreateSlotDto } from './dto/create-slot.dto';
import { UpdateSlotDto } from './dto/update-slot.dto';
import { Prisma, SlotType } from '@prisma/client';
import { addMinutes, format } from 'date-fns';

@Injectable()
export class PriestService {
  constructor(private readonly prisma: PrismaService) {}

  // -------------------------------
  // Priest CRUD
  // -------------------------------

  async createPriest(dto: CreatePriestDto) {
    const data: Prisma.PriestCreateInput = {
      name:           dto.name,
      specialty:      dto.specialty ?? null,
      contactNo:      dto.contactNo ?? null,
      email:          dto.email ?? null,
      address:        dto.address ?? null,
      languages:      dto.languages ?? [],
      qualifications: dto.qualifications ?? [],
    };
  
    // ✅ On CREATE: no disconnect. Either connect or omit.
    if (!dto.clearFeaturedMedia && typeof dto.featuredMediaId === 'number') {
      (data as any).featuredMedia = { connect: { id: dto.featuredMediaId } };
    }
  
    return this.prisma.priest.create({
      data,
      include: { featuredMedia: true },
    });
  }
  

  async getAllPriests() {
    return this.prisma.priest.findMany({
      include: { slots: true, bookings: true, featuredMedia: true },
      orderBy: { id: 'desc' },
    });
  }

  async getPriest(id: number) {
    return this.prisma.priest.findUnique({
      where:   { id },
      include: { slots: true, bookings: true, featuredMedia: true }
    });
  }

  async updatePriest(id: number, dto: UpdatePriestDto) {
    const data: Prisma.PriestUpdateInput = {
      ...(dto.name           !== undefined && { name:           dto.name }),
      ...(dto.specialty      !== undefined && { specialty:      dto.specialty }),
      ...(dto.contactNo      !== undefined && { contactNo:      dto.contactNo }),
      ...(dto.email          !== undefined && { email:          dto.email }),
      ...(dto.address        !== undefined && { address:        dto.address }),
      ...(dto.languages      !== undefined && { languages:      dto.languages }),
      ...(dto.qualifications !== undefined && { qualifications: dto.qualifications }),
    };

    if (dto.clearFeaturedMedia) {
      Object.assign(data, { featuredMedia: { disconnect: true } });
    } else if (typeof dto.featuredMediaId === 'number') {
      Object.assign(data, { featuredMedia: { connect: { id: dto.featuredMediaId } } });
    }

    return this.prisma.priest.update({
      where: { id },
      data,
      include: { featuredMedia: true },
    });
  }

  async deletePriest(id: number) {
    return this.prisma.priest.delete({ where: { id } });
  }

  // -------------------------------
  // AvailabilitySlot CRUD
  // -------------------------------

  async createSlot(dto: CreateSlotDto) {
    if (!dto.disabled) {
      const overlap = await this.prisma.availabilitySlot.findFirst({
        where: {
          priestId: dto.priestId,
          disabled: false,
          start:    { lte: new Date(dto.end) },
          end:      { gte: new Date(dto.start) },
        }
      });
      if (overlap) throw new BadRequestException('Conflicting slot already exists.');
    }

    return this.prisma.availabilitySlot.create({
      data: {
        priestId: dto.priestId,
        start:    new Date(dto.start),
        end:      new Date(dto.end),
        disabled: dto.disabled,
        type:     dto.type,
        ...(dto.date       && { date: new Date(dto.date) }),
        ...(dto.daysOfWeek && { daysOfWeek: dto.daysOfWeek }),
      }
    });
  }

  async getSlotsForPriest(priestId: number) {
    return this.prisma.availabilitySlot.findMany({ where: { priestId } });
  }

  async updateSlot(id: number, dto: UpdateSlotDto) {
    const data: Prisma.AvailabilitySlotUpdateInput = {
      ...(dto.priestId   !== undefined && { priestId:   dto.priestId }),
      ...(dto.start      !== undefined && { start:      new Date(dto.start) }),
      ...(dto.end        !== undefined && { end:        new Date(dto.end)   }),
      ...(dto.disabled   !== undefined && { disabled:   dto.disabled        }),
      ...(dto.type       !== undefined && { type:       dto.type            }),
      ...(dto.daysOfWeek !== undefined && { daysOfWeek: dto.daysOfWeek     }),
    };
    return this.prisma.availabilitySlot.update({ where: { id }, data });
  }

  async getSlotsForPriestInRange(priestId: number, from: Date, to: Date) {
    return this.prisma.availabilitySlot.findMany({
      where: { priestId, start: { gte: from }, end: { lte: to } },
      orderBy: { start: 'asc' }
    });
  }

  async deleteSlot(id: number) {
    return this.prisma.availabilitySlot.delete({ where: { id } });
  }

  // -------------------------------
  // Availability finder
  // -------------------------------

  async getAvailableChunks(priestId: number, bookingDate: string, totalMinutes: number) {
    const dateObj      = new Date(bookingDate)
    const weekdayShort = format(dateObj, 'EEE')

    const availSlots = await this.prisma.availabilitySlot.findMany({
      where: { priestId, disabled: false, OR: [{ date: dateObj }, { date: null }] }
    })

    const busySlots = await this.prisma.availabilitySlot.findMany({
      where: { priestId, disabled: true, date: dateObj }
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

      const start = new Date(bookingDate)
      start.setHours(slot.start.getHours(), slot.start.getMinutes(), 0, 0)

      const end = new Date(bookingDate)
      end.setHours(slot.end.getHours(), slot.end.getMinutes(), 0, 0)
      if (end <= start) end.setDate(end.getDate() + 1)

      const chunks = this.generateChunks(start, end, totalMinutes)
      validChunks.push(...chunks.map(c => ({ ...c, priestId: slot.priestId, type: slot.type })))
    }

    const busyRanges = busySlots.map(slot => {
      const bs = new Date(bookingDate)
      bs.setHours(slot.start.getHours(), slot.start.getMinutes(), 0, 0)
      const be = new Date(bookingDate)
      be.setHours(slot.end.getHours(), slot.end.getMinutes(), 0, 0)
      if (be <= bs) be.setDate(be.getDate() + 1)
      return { start: bs, end: be }
    })

    const existing = await this.prisma.booking.findMany({ where: { priestId, bookingDate: dateObj } })

    const available = validChunks.filter(chunk =>
      !existing.some(b => this.overlaps(chunk.start, chunk.end, b.start, b.end)) &&
      !busyRanges.some(b => this.overlaps(chunk.start, chunk.end, b.start, b.end))
    )

    return available
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

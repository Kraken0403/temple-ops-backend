import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { CreatePriestDto } from './dto/create-priest.dto';
import { UpdatePriestDto } from './dto/update-priest.dto';
import { CreateSlotDto } from './dto/create-slot.dto';
import { UpdateSlotDto } from './dto/update-slot.dto';
import { Prisma, SlotType } from '@prisma/client';
import { subMinutes, addMinutes, isSameDay, format } from 'date-fns'
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class PriestService {
  constructor(private readonly prisma: PrismaService) {}

  // -------------------------------
  // Priest CRUD
  // -------------------------------

  async createPriest(dto: CreatePriestDto) {
    return this.prisma.priest.create({
      data: {
        name:           dto.name,
        specialty:      dto.specialty ?? null,
        photo:          dto.photo ?? null,
        contactNo:      dto.contactNo ?? null,
        email:          dto.email ?? null,
        address:        dto.address ?? null,
        languages:      dto.languages ?? [],
        qualifications: dto.qualifications ?? [],
      }
    });
  }

  async savePhotoAndGetUrl(file: Express.Multer.File): Promise<string> {
    const uploadsDir = path.join(__dirname, '..', '..', 'uploads');
    if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir);
    const fileName = Date.now() + '-' + file.originalname.replace(/\s+/g, '_');
    const filePath = path.join(uploadsDir, fileName);
    fs.writeFileSync(filePath, file.buffer);
    return `/uploads/${fileName}`;
  }

  async getAllPriests() {
    return this.prisma.priest.findMany({ include: { slots: true, bookings: true } });
  }

  async getPriest(id: number) {
    return this.prisma.priest.findUnique({
      where:   { id },
      include: { slots: true, bookings: true }
    });
  }

  async updatePriest(id: number, dto: UpdatePriestDto) {
    const data: Prisma.PriestUpdateInput = {
      ...(dto.name           !== undefined && { name:           dto.name }),
      ...(dto.specialty      !== undefined && { specialty:      dto.specialty }),
      ...(dto.photo          !== undefined && { photo:          dto.photo }),
      ...(dto.contactNo      !== undefined && { contactNo:      dto.contactNo }),
      ...(dto.email          !== undefined && { email:          dto.email }),
      ...(dto.address        !== undefined && { address:        dto.address }),
      ...(dto.languages      !== undefined && { languages:      dto.languages }),
      ...(dto.qualifications !== undefined && { qualifications: dto.qualifications }),
    };

    return this.prisma.priest.update({
      where: { id },
      data
    });
  }

  async deletePriest(id: number) {
    return this.prisma.priest.delete({ where: { id } });
  }

  // -------------------------------
  // AvailabilitySlot CRUD
  // -------------------------------

  async createSlot(dto: CreateSlotDto) {
    // 1️⃣ Only enforce overlap-check for non-disabled slots
    if (!dto.disabled) {
      const overlap = await this.prisma.availabilitySlot.findFirst({
        where: {
          priestId: dto.priestId,
          disabled: false,                // ignore any already-disabled slots
          start:    { lte: new Date(dto.end) },
          end:      { gte: new Date(dto.start) },
        }
      });
      if (overlap) {
        throw new BadRequestException('Conflicting slot already exists.');
      }
    }
  
    // 2️⃣ Create regardless of disabled flag
    return this.prisma.availabilitySlot.create({
      data: {
        priestId: dto.priestId,
        start:    new Date(dto.start),
        end:      new Date(dto.end),
        disabled: dto.disabled,
        type:     dto.type,
        ...(dto.date        && { date:      new Date(dto.date) }),
        ...(dto.daysOfWeek  && { daysOfWeek: dto.daysOfWeek }),
      }
    });
  }
  



  async getSlotsForPriest(priestId: number) {
    return this.prisma.availabilitySlot.findMany({
      where: { priestId }
    })
  }

  async updateSlot(id: number, dto: UpdateSlotDto) {
    const data: Prisma.AvailabilitySlotUpdateInput = {
      ...(dto.priestId   !== undefined && { priestId:   dto.priestId }),
      ...(dto.start      !== undefined && { start:      new Date(dto.start) }),
      ...(dto.end        !== undefined && { end:        new Date(dto.end)   }),
      ...(dto.disabled   !== undefined && { disabled:   dto.disabled        }),
      ...(dto.type       !== undefined && { type:       dto.type            }),
      ...(dto.daysOfWeek !== undefined && { daysOfWeek: dto.daysOfWeek     }),
    }

    return this.prisma.availabilitySlot.update({
      where: { id },
      data
    })
  }

  async getSlotsForPriestInRange(priestId: number, from: Date, to: Date) {
    return this.prisma.availabilitySlot.findMany({
      where: {
        priestId,
        start: { gte: from },
        end:   { lte: to }
      },
      orderBy: { start: 'asc' }
    })
  }

  async deleteSlot(id: number) {
    return this.prisma.availabilitySlot.delete({ where: { id } })
  }

  async getAvailableChunks(priestId: number, bookingDate: string, totalMinutes: number) {
    const dateObj     = new Date(bookingDate)
    const weekdayShort = format(dateObj, 'EEE') // "Mon", "Tue", etc.
  
    // 1️⃣ Fetch AVAILABLE slots (weekly + one-offs)
    const availSlots = await this.prisma.availabilitySlot.findMany({
      where: {
        priestId,
        disabled: false,
        OR: [
          { date: dateObj },
          { date: null }
        ]
      }
    })
  
    // 2️⃣ Fetch one-off BUSY/HOLIDAY overrides for that exact date
    const busySlots = await this.prisma.availabilitySlot.findMany({
      where: {
        priestId,
        disabled: true,
        date: dateObj
      }
    })
  
    // 3️⃣ Build all possible chunks from your AVAILABLE slots
    const validChunks: { start: Date, end: Date, priestId: number, type: SlotType }[] = []
    for (const slot of availSlots) {
      // Skip weekly slots when weekday doesn’t match
      if (!slot.date) {
        const days: string[] = Array.isArray(slot.daysOfWeek)
          ? slot.daysOfWeek
          : typeof slot.daysOfWeek === 'string'
            ? JSON.parse(slot.daysOfWeek)
            : []
        if (!days.includes(weekdayShort)) continue
      }
  
      // Anchor that slot’s time-of-day on the booking date
      const start = new Date(bookingDate)
      start.setHours(slot.start.getHours(), slot.start.getMinutes(), 0, 0)
  
      const end = new Date(bookingDate)
      end.setHours(slot.end.getHours(), slot.end.getMinutes(), 0, 0)
      // overnight?
      if (end <= start) end.setDate(end.getDate() + 1)
  
      // Slice into duration‐sized chunks
      const chunks = this.generateChunks(start, end, totalMinutes)
      validChunks.push(...chunks.map(c => ({
        ...c,
        priestId: slot.priestId,
        type:     slot.type
      })))
    }
  
    // 4️⃣ Build concrete ranges for your BUSY overrides
    const busyRanges = busySlots.map(slot => {
      const bs = new Date(bookingDate)
      bs.setHours(slot.start.getHours(), slot.start.getMinutes(), 0, 0)
      const be = new Date(bookingDate)
      be.setHours(slot.end.getHours(), slot.end.getMinutes(), 0, 0)
      if (be <= bs) be.setDate(be.getDate() + 1)
      return { start: bs, end: be }
    })
  
    // 5️⃣ Exclude any chunk that overlaps a confirmed booking or a busy override
    const existing = await this.prisma.booking.findMany({
      where: { priestId, bookingDate: dateObj }
    })
  
    const available = validChunks.filter(chunk =>
      // no booking overlap
      !existing.some(b => this.overlaps(chunk.start, chunk.end, b.start, b.end)) &&
      // no busy override overlap
      !busyRanges.some(b => this.overlaps(chunk.start, chunk.end, b.start, b.end))
    )
  
    console.log('🔍 AVAILABLE SLOTS:',   availSlots.length)
    console.log('🔍 BUSY OVERRIDES:',    busySlots.length)
    console.log('🔍 RAW CHUNKS:',         validChunks.length)
    console.log('🔍 BUSY RANGES:',        busyRanges)
    console.log('✅ RETURNED CHUNKS:',     available.length)
  
    return available
  }
  
  
  
  
  generateChunks(start: Date, end: Date, durationMin: number) {
      const chunks = []
      let current = new Date(start)

      while (addMinutes(current, durationMin) <= end) {
        const chunkEnd = addMinutes(current, durationMin)
        chunks.push({ start: new Date(current), end: chunkEnd })
        current = chunkEnd // move to the end of previous chunk
      }

      return chunks
    }


  overlaps(aStart: Date, aEnd: Date, bStart: Date, bEnd: Date) {
    return aStart < bEnd && aEnd > bStart
  }
  
  
  
}
// src/events/events.service.ts

import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { BookEventDto } from './dto/book-event.dto';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class EventsService {
  constructor(private readonly prisma: PrismaService) {}

  /** Save an uploaded file buffer to disk and return its public URL */
  async savePhotoAndGetUrl(file: Express.Multer.File): Promise<string> {
    const uploadsDir = path.join(__dirname, '..', '..', 'uploads');
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }
    const fileName = Date.now() + '-' + file.originalname.replace(/\s+/g, '_');
    const filePath = path.join(uploadsDir, fileName);
    fs.writeFileSync(filePath, file.buffer);
    return `/uploads/${fileName}`;
  }

  /** Create a new event */
  async create(createDto: CreateEventDto) {
    return this.prisma.event.create({
      data: {
        ...createDto,
        tags: createDto.tags ?? undefined,
      },
    });
  }

  /** List all events */
  findAll() {
    return this.prisma.event.findMany({ orderBy: { date: 'asc' } });
  }

  /** Get one event */
  async findOne(id: number) {
    const ev = await this.prisma.event.findUnique({ where: { id } });
    if (!ev) throw new NotFoundException(`Event ${id} not found`);
    return ev;
  }

  /** Update an existing event */
  async update(id: number, updateDto: UpdateEventDto) {
    await this.findOne(id);
    return this.prisma.event.update({
      where: { id },
      data: {
        ...updateDto,
        tags: updateDto.tags ?? undefined,
      },
    });
  }

  /** Delete an event */
  async remove(id: number) {
    await this.findOne(id);
    return this.prisma.event.delete({ where: { id } });
  }

  

  /**
   * Guest booking: reserve `pax` seats without requiring a user account.
   * Stores contact info in the booking record.
   */
  async bookEventAsGuest(eventId: number, dto: BookEventDto) {
    // 1) Ensure event exists
    const ev = await this.prisma.event.findUnique({ where: { id: eventId } });
    if (!ev) throw new NotFoundException(`Event ${eventId} not found`);

    // 2) Enforce capacity if set
    if (ev.capacity != null) {
      const aggregate = await this.prisma.eventBooking.aggregate({
        where: { eventId, status: 'confirmed' },
        _sum: { pax: true },
      });
      const alreadyBooked = aggregate._sum.pax ?? 0;
      if (alreadyBooked + dto.pax > ev.capacity) {
        throw new BadRequestException('Not enough seats available');
      }
    }

    // 3) Create booking record
    return this.prisma.eventBooking.create({
      data: {
        event:     { connect: { id: eventId } },
        pax:        dto.pax,
        userName:   dto.userName  ?? null,
        userEmail:  dto.userEmail ?? null,
        userPhone:  dto.userPhone ?? null,
        status:    'confirmed',
      },
    });
  }

  async findBookings(eventId: number) {
    // ensure the event exists
    const ev = await this.prisma.event.findUnique({ where: { id: eventId } });
    if (!ev) throw new NotFoundException(`Event ${eventId} not found`);

    // fetch and return
    return this.prisma.eventBooking.findMany({
      where: { eventId },
      orderBy: { bookedAt: 'desc' },
    });
  }
   
}
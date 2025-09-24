import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { BookEventDto } from './dto/book-event.dto';

@Injectable()
export class EventsService {
  constructor(private readonly prisma: PrismaService) {}

  /* ───────────────── CRUD ───────────────── */

  async create(createDto: CreateEventDto) {
    const data: any = {
      name:        createDto.name,
      description: createDto.description ?? null,
      venue:       createDto.venue,
      mapLink:     createDto.mapLink ?? null,
      date:        new Date(createDto.date),
      endDate:     createDto.endDate   ? new Date(createDto.endDate)   : null,
      startTime:   createDto.startTime ? new Date(createDto.startTime) : null,
      endTime:     createDto.endTime   ? new Date(createDto.endTime)   : null,
      tags:        createDto.tags ?? undefined,
      capacity:    createDto.capacity ?? null,
      price:       createDto.price ?? null,
      organizer:   createDto.organizer ?? null,
      contactInfo: createDto.contactInfo ?? null,
      isPublic:    createDto.isPublic ?? true,
    };
  
    // ✅ On CREATE: no disconnect. Either connect or omit.
    if (!createDto.clearFeaturedMedia && typeof createDto.featuredMediaId === 'number') {
      data.featuredMedia = { connect: { id: createDto.featuredMediaId } };
    }
  
    return this.prisma.event.create({
      data,
      include: {
        featuredMedia: true,
        gallery: { include: { media: true }, orderBy: { sortOrder: 'asc' } },
      },
    });
  }
  

  findAll() {
    return this.prisma.event.findMany({
      orderBy: { date: 'asc' },
      include: { featuredMedia: true },
    });
  }

  async findOne(id: number) {
    const ev = await this.prisma.event.findUnique({
      where: { id },
      include: {
        featuredMedia: true,
        gallery: { include: { media: true }, orderBy: { sortOrder: 'asc' } },
      },
    });
    if (!ev) throw new NotFoundException(`Event ${id} not found`);
    return ev;
  }

  async update(id: number, updateDto: UpdateEventDto) {
    await this.ensureExists(id);

    const data: any = {
      ...(updateDto.name        !== undefined && { name:        updateDto.name }),
      ...(updateDto.description !== undefined && { description: updateDto.description }),
      ...(updateDto.venue       !== undefined && { venue:       updateDto.venue }),
      ...(updateDto.mapLink     !== undefined && { mapLink:     updateDto.mapLink }),
      ...(updateDto.date        !== undefined && { date:        new Date(updateDto.date) }),
      ...(updateDto.endDate     !== undefined && { endDate:     updateDto.endDate   ? new Date(updateDto.endDate)   : null }),
      ...(updateDto.startTime   !== undefined && { startTime:   updateDto.startTime ? new Date(updateDto.startTime) : null }),
      ...(updateDto.endTime     !== undefined && { endTime:     updateDto.endTime   ? new Date(updateDto.endTime)   : null }),
      ...(updateDto.tags        !== undefined && { tags:        updateDto.tags }),
      ...(updateDto.capacity    !== undefined && { capacity:    updateDto.capacity }),
      ...(updateDto.price       !== undefined && { price:       updateDto.price }),
      ...(updateDto.organizer   !== undefined && { organizer:   updateDto.organizer }),
      ...(updateDto.contactInfo !== undefined && { contactInfo: updateDto.contactInfo }),
      ...(updateDto.isPublic    !== undefined && { isPublic:    updateDto.isPublic }),
    };

    if (updateDto.clearFeaturedMedia) {
      data.featuredMedia = { disconnect: true }
    } else if (typeof updateDto.featuredMediaId === 'number') {
      data.featuredMedia = { connect: { id: updateDto.featuredMediaId } }
    }

    return this.prisma.event.update({
      where: { id },
      data,
      include: {
        featuredMedia: true,
        gallery: { include: { media: true }, orderBy: { sortOrder: 'asc' } },
      },
    });
  }

  async remove(id: number) {
    await this.ensureExists(id);
    await this.prisma.eventMedia.deleteMany({ where: { eventId: id } });
    return this.prisma.event.delete({ where: { id } });
  }

  /* ───────────────── Booking ───────────────── */

  async bookEventAsGuest(eventId: number, dto: BookEventDto) {
    const ev = await this.prisma.event.findUnique({ where: { id: eventId } });
    if (!ev) throw new NotFoundException(`Event ${eventId} not found`);

    if (ev.capacity != null) {
      const aggregate = await this.prisma.eventBooking.aggregate({
        where: { eventId, status: 'confirmed' },
        _sum: { pax: true },
      });
      const already = aggregate._sum.pax ?? 0;
      if (already + dto.pax > ev.capacity) {
        throw new BadRequestException('Not enough seats available');
      }
    }

    return this.prisma.eventBooking.create({
      data: {
        event: { connect: { id: eventId } },
        pax: dto.pax,
        userName: dto.userName ?? null,
        userEmail: dto.userEmail ?? null,
        userPhone: dto.userPhone ?? null,
        status: 'confirmed',
      },
    });
  }

  async findBookings(eventId: number) {
    await this.ensureExists(eventId);
    return this.prisma.eventBooking.findMany({
      where: { eventId },
      orderBy: { bookedAt: 'desc' },
    });
  }

  /* ───────────────── Media picker (explicit) ───────────────── */

  async setFeaturedMedia(eventId: number, mediaId: number | null) {
    await this.ensureExists(eventId);
    if (mediaId != null) {
      const exists = await this.prisma.mediaAsset.count({ where: { id: mediaId } });
      if (!exists) throw new BadRequestException('mediaId not found');
    }

    return this.prisma.event.update({
      where: { id: eventId },
      data: { featuredMediaId: mediaId },
      include: {
        featuredMedia: true,
        gallery: { include: { media: true }, orderBy: { sortOrder: 'asc' } },
      },
    });
  }

  async addToGallery(eventId: number, mediaIds: number[]) {
    await this.ensureExists(eventId);
    if (!mediaIds?.length) return { ok: true };

    const ids = [...new Set(mediaIds)];
    const count = await this.prisma.mediaAsset.count({ where: { id: { in: ids } } });
    if (count !== ids.length) throw new BadRequestException('Some mediaIds do not exist');

    const max = await this.prisma.eventMedia.aggregate({
      where: { eventId },
      _max: { sortOrder: true },
    });
    let start = (max._max.sortOrder ?? -1) + 1;

    await this.prisma.eventMedia.createMany({
      data: ids.map((mid) => ({ eventId, mediaId: mid, sortOrder: start++ })),
      skipDuplicates: true,
    });

    return this.prisma.event.findUnique({
      where: { id: eventId },
      include: { gallery: { include: { media: true }, orderBy: { sortOrder: 'asc' } } },
    });
  }

  async reorderGallery(eventId: number, orders: { mediaId: number; sortOrder: number }[]) {
    await this.ensureExists(eventId);
    await this.prisma.eventMedia.deleteMany({ where: { eventId } });

    const data = (orders ?? [])
      .slice()
      .sort((a, b) => a.sortOrder - b.sortOrder)
      .map((o, i) => ({ eventId, mediaId: o.mediaId, sortOrder: i }));

    if (data.length) await this.prisma.eventMedia.createMany({ data });

    return { ok: true };
  }

  async removeFromGallery(eventId: number, mediaId: number) {
    await this.ensureExists(eventId);
    await this.prisma.eventMedia.deleteMany({ where: { eventId, mediaId } });
    return { ok: true };
  }

  /* ───────────────── Utils ───────────────── */
  private async ensureExists(id: number) {
    const ev = await this.prisma.event.findUnique({ where: { id } });
    if (!ev) throw new NotFoundException(`Event ${id} not found`);
  }
}

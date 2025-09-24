// src/events/events.service.ts
import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { BookEventDto } from './dto/book-event.dto';

type EventWindowish = {
  date: Date;
  endDate: Date | null;
  startTime: Date | null;
  endTime: Date | null;
};

@Injectable()
export class EventsService {
  constructor(private readonly prisma: PrismaService) {}

  /* ───────────────────────────── Helpers ───────────────────────────── */

  /**
   * Build concrete startAt/endAt from your event's date + (optional) startTime / endDate + endTime.
   * We treat 'date' and 'endDate' as day buckets, and lay 'startTime'/'endTime' hours onto those days.
   * All comparisons are done with JS Dates (assumes your stored values are in UTC or consistently parsed).
   */
  private getEventWindow(ev: EventWindowish) {
    const toYmdUTC = (d: Date) =>
      new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate(), 0, 0, 0, 0));

    const dateBase = ev.date ? toYmdUTC(new Date(ev.date)) : null;
    const endBase = ev.endDate ? toYmdUTC(new Date(ev.endDate)) : dateBase;

    // startAt = date Y-M-D + (startTime H:M:S if provided, else 00:00)
    let startAt: Date | null = null;
    if (dateBase) {
      if (ev.startTime) {
        const t = new Date(ev.startTime);
        startAt = new Date(
          Date.UTC(
            dateBase.getUTCFullYear(),
            dateBase.getUTCMonth(),
            dateBase.getUTCDate(),
            t.getUTCHours(),
            t.getUTCMinutes(),
            t.getUTCSeconds(),
            t.getUTCMilliseconds(),
          ),
        );
      } else {
        startAt = dateBase;
      }
    }

    // endAt = (endDate||date) Y-M-D + (endTime H:M:S if provided, else 00:00)
    let endAt: Date | null = null;
    if (endBase) {
      if (ev.endTime) {
        const t = new Date(ev.endTime);
        endAt = new Date(
          Date.UTC(
            endBase.getUTCFullYear(),
            endBase.getUTCMonth(),
            endBase.getUTCDate(),
            t.getUTCHours(),
            t.getUTCMinutes(),
            t.getUTCSeconds(),
            t.getUTCMilliseconds(),
          ),
        );
      } else {
        endAt = endBase;
      }
    }

    return { startAt, endAt };
  }

  /**
   * Business rule: registrations are open until event **start**.
   * If you want to keep them open until the **end**, switch to the commented line.
   */
  private isOpenForRegistration(ev: EventWindowish, now = new Date()) {
    const { startAt /*, endAt*/ } = this.getEventWindow(ev);

    if (!startAt) return false; // malformed → be safe
    return now < startAt; // ✅ close at start

    // return endAt ? now < endAt : now < startAt; // ⬅️ uncomment to close at end
  }

  private async ensureExists(id: number) {
    const ev = await this.prisma.event.findUnique({ where: { id } });
    if (!ev) throw new NotFoundException(`Event ${id} not found`);
  }

  /* ───────────────────────────── CRUD ───────────────────────────── */

  async create(createDto: CreateEventDto) {
    const data: any = {
      name:        createDto.name,
      description: createDto.description ?? null,

      // venue (either legacy free text or saved Venue)
      venue:       createDto.venue ?? null,
      mapLink:     createDto.mapLink ?? null,
      venueId:     createDto.venueId ?? null,

      // unified flags (mirror Pooja)
      isInVenue:      createDto.isInVenue ?? false,
      isOutsideVenue: createDto.isOutsideVenue ?? true,

      // dates & times
      date:        new Date(createDto.date),
      endDate:     createDto.endDate   ? new Date(createDto.endDate)   : null,
      startTime:   createDto.startTime ? new Date(createDto.startTime) : null,
      endTime:     createDto.endTime   ? new Date(createDto.endTime)   : null,

      // misc
      tags:        createDto.tags ?? undefined,
      capacity:    createDto.capacity ?? null,
      price:       createDto.price ?? null,
      organizer:   createDto.organizer ?? null,
      contactInfo: createDto.contactInfo ?? null,
      isPublic:    createDto.isPublic ?? true,
    };

    // featured image
    if (!createDto.clearFeaturedMedia && typeof createDto.featuredMediaId === 'number') {
      data.featuredMedia = { connect: { id: createDto.featuredMediaId } };
    }

    return this.prisma.event
      .create({
        data,
        include: {
          featuredMedia: true,
          gallery: { include: { media: true }, orderBy: { sortOrder: 'asc' } },
        },
      })
      .then((ev) => ({
        ...ev,
        isOpenForRegistration: this.isOpenForRegistration(ev as unknown as EventWindowish),
      }));
  }

  findAll() {
    return this.prisma.event
      .findMany({
        orderBy: { date: 'asc' },
        include: { featuredMedia: true },
      })
      .then((rows) =>
        rows.map((ev) => ({
          ...ev,
          isOpenForRegistration: this.isOpenForRegistration(ev as unknown as EventWindowish),
        })),
      );
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
    return {
      ...ev,
      isOpenForRegistration: this.isOpenForRegistration(ev as unknown as EventWindowish),
    };
  }

  async update(id: number, updateDto: UpdateEventDto) {
    await this.ensureExists(id);

    const data: any = {
      ...(updateDto.name        !== undefined && { name:        updateDto.name }),
      ...(updateDto.description !== undefined && { description: updateDto.description }),

      ...(updateDto.venueId     !== undefined && { venueId:     updateDto.venueId }),
      ...(updateDto.venue       !== undefined && { venue:       updateDto.venue }),
      ...(updateDto.mapLink     !== undefined && { mapLink:     updateDto.mapLink }),

      ...(updateDto.isInVenue      !== undefined && { isInVenue:      updateDto.isInVenue }),
      ...(updateDto.isOutsideVenue !== undefined && { isOutsideVenue: updateDto.isOutsideVenue }),

      ...(updateDto.date      !== undefined && { date:      new Date(updateDto.date) }),
      ...(updateDto.endDate   !== undefined && { endDate:   updateDto.endDate   ? new Date(updateDto.endDate)   : null }),
      ...(updateDto.startTime !== undefined && { startTime: updateDto.startTime ? new Date(updateDto.startTime) : null }),
      ...(updateDto.endTime   !== undefined && { endTime:   updateDto.endTime   ? new Date(updateDto.endTime)   : null }),

      ...(updateDto.tags        !== undefined && { tags:        updateDto.tags }),
      ...(updateDto.capacity    !== undefined && { capacity:    updateDto.capacity }),
      ...(updateDto.price       !== undefined && { price:       updateDto.price }),
      ...(updateDto.organizer   !== undefined && { organizer:   updateDto.organizer }),
      ...(updateDto.contactInfo !== undefined && { contactInfo: updateDto.contactInfo }),
      ...(updateDto.isPublic    !== undefined && { isPublic:    updateDto.isPublic }),
    };

    // featured image connect/disconnect
    if (updateDto.clearFeaturedMedia) {
      data.featuredMedia = { disconnect: true };
    } else if (typeof updateDto.featuredMediaId === 'number') {
      data.featuredMedia = { connect: { id: updateDto.featuredMediaId } };
    }

    return this.prisma.event
      .update({
        where: { id },
        data,
        include: {
          featuredMedia: true,
          gallery: { include: { media: true }, orderBy: { sortOrder: 'asc' } },
        },
      })
      .then((ev) => ({
        ...ev,
        isOpenForRegistration: this.isOpenForRegistration(ev as unknown as EventWindowish),
      }));
  }

  async remove(id: number) {
    await this.ensureExists(id);
    await this.prisma.eventMedia.deleteMany({ where: { eventId: id } });
    return this.prisma.event.delete({ where: { id } });
  }

  /* ─────────────────────────── Bookings ─────────────────────────── */

  async bookEventAsGuest(eventId: number, dto: BookEventDto) {
    const ev = await this.prisma.event.findUnique({ where: { id: eventId } });
    if (!ev) throw new NotFoundException(`Event ${eventId} not found`);

    // ⛔ Time-window gate (authoritative)
    if (!this.isOpenForRegistration(ev as unknown as EventWindowish)) {
      throw new BadRequestException('Registrations are closed for this event');
    }

    // Capacity gate
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

    // Create booking
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

  /* ───────────────────── Media / Gallery helpers ─────────────────── */

  async setFeaturedMedia(eventId: number, mediaId: number | null) {
    await this.ensureExists(eventId);
    if (mediaId != null) {
      const exists = await this.prisma.mediaAsset.count({ where: { id: mediaId } });
      if (!exists) throw new BadRequestException('mediaId not found');
    }

    return this.prisma.event
      .update({
        where: { id: eventId },
        data: { featuredMediaId: mediaId },
        include: {
          featuredMedia: true,
          gallery: { include: { media: true }, orderBy: { sortOrder: 'asc' } },
        },
      })
      .then((ev) => ({
        ...ev,
        isOpenForRegistration: this.isOpenForRegistration(ev as unknown as EventWindowish),
      }));
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

    const ev = await this.prisma.event.findUnique({
      where: { id: eventId },
      include: { gallery: { include: { media: true }, orderBy: { sortOrder: 'asc' } } },
    });
    return {
      ...ev,
      isOpenForRegistration: ev
        ? this.isOpenForRegistration(ev as unknown as EventWindowish)
        : false,
    };
  }

  async reorderGallery(
    eventId: number,
    orders: { mediaId: number; sortOrder: number }[],
  ) {
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
}

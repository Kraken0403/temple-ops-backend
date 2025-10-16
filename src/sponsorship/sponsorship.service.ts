// src/sponsorship/sponsorship.service.ts
import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common'
import { PrismaService } from '../prisma.service'
import { NotificationsService } from '../notifications/notifications.service'

import { CreateSponsorshipTypeDto } from './dto/create-sponsorship-type.dto'
import { UpdateSponsorshipTypeDto } from './dto/update-sponsorship-type.dto'
import { CreateEventSponsorshipDto } from './dto/create-event-sponsorship.dto'
import { UpdateEventSponsorshipDto } from './dto/update-event-sponsorship.dto'
import { CreateSponsorshipBookingDto } from './dto/create-sponsorship-booking.dto'
import { UpdateSponsorshipBookingDto } from './dto/update-sponsorship-booking.dto'

type PrismaKnownError = { code?: string; meta?: any }

@Injectable()
export class SponsorshipService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly notifications: NotificationsService,
  ) {}

  /* ───────────────────────── helpers ───────────────────────── */

  private toDateOrNull(v: unknown): Date | null {
    if (!v) return null
    const d = new Date(String(v))
    return Number.isNaN(d.getTime()) ? null : d
  }

  /**
   * Keep the standalone (general) EventSponsorship row in sync with the type.
   * - If type.defaultMaxSlots > 0 and isActive ⇒ ensure row exists/updated
   * - Else ⇒ delete the standalone row (and its bookings)
   */
  private async ensureIndependentRowForType(typeId: number): Promise<void> {
    const type = await this.prisma.sponsorshipType.findUnique({ where: { id: typeId } })
    if (!type) return

    const existing = await this.prisma.eventSponsorship.findFirst({
      where: { eventId: null, sponsorshipTypeId: type.id },
      include: { bookings: true },
    })

    const shouldExist = (type.defaultMaxSlots ?? 0) > 0 && type.isActive !== false

    if (shouldExist) {
      if (existing) {
        // update the independent row to reflect type changes (price/maxSlots)
        await this.prisma.eventSponsorship.update({
          where: { id: existing.id },
          data: {
            maxSlots: type.defaultMaxSlots!,
            price: type.price,
          },
        })
      } else {
        await this.prisma.eventSponsorship.create({
          data: {
            eventId: null,
            sponsorshipTypeId: type.id,
            maxSlots: type.defaultMaxSlots!,
            price: type.price,
          },
        })
      }
    } else if (existing) {
      // remove general row and its bookings
      await this.prisma.$transaction(async (tx) => {
        await tx.sponsorshipBooking.deleteMany({
          where: { eventSponsorshipId: existing.id },
        })
        await tx.eventSponsorship.delete({ where: { id: existing.id } })
      })
    }
  }

  /* ───────────────────────── types ───────────────────────── */

  async createType(dto: CreateSponsorshipTypeDto) {
    try {
      const type = await this.prisma.sponsorshipType.create({
        data: {
          name: dto.name,
          description: dto.description,
          price: dto.price,

          startsAt: this.toDateOrNull(dto.startsAt),
          endsAt: this.toDateOrNull(dto.endsAt),
          isActive: dto.isActive ?? true,
          defaultMaxSlots: dto.defaultMaxSlots ?? null,
        },
      })

      // mirror into standalone row if configured
      await this.ensureIndependentRowForType(type.id)
      return type
    } catch (e: unknown) {
      const err = e as PrismaKnownError
      if (err?.code === 'P2002' && err?.meta?.target?.toString().includes('name')) {
        throw new BadRequestException('A sponsorship type with this name already exists.')
      }
      throw e
    }
  }

  async updateType(id: number, dto: UpdateSponsorshipTypeDto) {
    const existing = await this.prisma.sponsorshipType.findUnique({ where: { id } })
    if (!existing) throw new NotFoundException('Sponsorship type not found')

    try {
      const type = await this.prisma.sponsorshipType.update({
        where: { id },
        data: {
          ...(dto.name !== undefined && { name: dto.name }),
          ...(dto.description !== undefined && { description: dto.description }),
          ...(dto.price !== undefined && { price: dto.price }),

          ...(dto.startsAt !== undefined && { startsAt: this.toDateOrNull(dto.startsAt) }),
          ...(dto.endsAt !== undefined && { endsAt: this.toDateOrNull(dto.endsAt) }),
          ...(dto.isActive !== undefined && { isActive: dto.isActive }),
          ...(dto.defaultMaxSlots !== undefined && { defaultMaxSlots: dto.defaultMaxSlots }),
        },
      })

      // mirror into standalone row if configured
      await this.ensureIndependentRowForType(type.id)
      return type
    } catch (e: unknown) {
      const err = e as PrismaKnownError
      if (err?.code === 'P2002' && err?.meta?.target?.toString().includes('name')) {
        throw new BadRequestException('A sponsorship type with this name already exists.')
      }
      throw e
    }
  }

  async getAllTypes() {
    return this.prisma.sponsorshipType.findMany({
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        name: true,
        description: true,
        price: true,
        createdAt: true,
        startsAt: true,
        endsAt: true,
        isActive: true,
        defaultMaxSlots: true,
        _count: { select: { eventSponsorships: true } },
      },
    })
  }

  /** Safe delete: forbid if still assigned anywhere */
  async deleteTypeSafe(id: number) {
    const type = await this.prisma.sponsorshipType.findUnique({
      where: { id },
      include: { eventSponsorships: true },
    })
    if (!type) throw new NotFoundException('Sponsorship type not found')

    if (type.eventSponsorships.length > 0) {
      throw new BadRequestException(
        'Cannot delete: this type is assigned to one or more events. Remove assignments first or use force=true.',
      )
    }

    return this.prisma.sponsorshipType.delete({ where: { id } })
  }

  /** Force delete: remove all eventSponsorships (and their bookings), then delete the type */
  async deleteTypeForce(id: number) {
    const type = await this.prisma.sponsorshipType.findUnique({
      where: { id },
      include: { eventSponsorships: true },
    })
    if (!type) throw new NotFoundException('Sponsorship type not found')

    const esIds = type.eventSponsorships.map((es) => es.id)
    return this.prisma.$transaction(async (tx) => {
      if (esIds.length > 0) {
        await tx.sponsorshipBooking.deleteMany({
          where: { eventSponsorshipId: { in: esIds } },
        })
        await tx.eventSponsorship.deleteMany({
          where: { id: { in: esIds } },
        })
      }
      return tx.sponsorshipType.delete({ where: { id } })
    })
  }

  /* ───────────────────── event/independent rows ───────────────────── */

  async assignToEvent(dto: CreateEventSponsorshipDto) {
    const { eventId, sponsorshipTypeId, maxSlots, price } = dto

    const type = await this.prisma.sponsorshipType.findUnique({
      where: { id: sponsorshipTypeId },
    })
    if (!type) {
      throw new NotFoundException(`Sponsorship type with ID ${sponsorshipTypeId} not found`)
    }

    // Upsert on composite (eventId, sponsorshipTypeId)
    return this.prisma.eventSponsorship.upsert({
      where: { eventId_sponsorshipTypeId: { eventId, sponsorshipTypeId } },
      update: { maxSlots, price: price ?? type.price },
      create: { eventId, sponsorshipTypeId, maxSlots, price: price ?? type.price },
    })
  }

  async updateEventSponsorship(id: number, dto: UpdateEventSponsorshipDto) {
    const existing = await this.prisma.eventSponsorship.findUnique({ where: { id } })
    if (!existing) throw new NotFoundException('Event sponsorship not found')

    return this.prisma.eventSponsorship.update({
      where: { id },
      data: {
        ...(dto.maxSlots !== undefined && { maxSlots: dto.maxSlots }),
        ...(dto.price !== undefined && { price: dto.price }),
      },
      include: {
        event: true,
        sponsorshipType: true,
        bookings: true,
      },
    })
  }

  /** All rows (event + independent) */
  async getAllEventSponsorships() {
    return this.prisma.eventSponsorship.findMany({
      include: { sponsorshipType: true, event: true, bookings: true },
      orderBy: { id: 'desc' },
    })
  }

  /** Only independent (eventId = null); optionally filter to "available now" */
  async listIndependentSponsorships(availableOnly = false) {
    const rows = await this.prisma.eventSponsorship.findMany({
      where: { eventId: null },
      include: { sponsorshipType: true, bookings: true },
      orderBy: { id: 'desc' },
    })
    if (!availableOnly) return rows

    const now = Date.now()
    return rows.filter((r) => {
      const t = r.sponsorshipType
      if (!t || t.isActive === false) return false
      const startsOk = !t.startsAt || new Date(t.startsAt).getTime() <= now
      const endsOk = !t.endsAt || new Date(t.endsAt).getTime() >= now
      const max = r.maxSlots ?? t.defaultMaxSlots ?? 0
      const booked = r.bookings?.length ?? 0
      const slotsOk = booked < max
      return startsOk && endsOk && slotsOk
    })
  }

  async getEventSponsorshipById(id: number) {
    return this.prisma.eventSponsorship.findUnique({
      where: { id },
      include: { event: true, sponsorshipType: true, bookings: true },
    })
  }

  async getSponsorshipsForEvent(eventId: number) {
    return this.prisma.eventSponsorship.findMany({
      where: { eventId },
      include: { sponsorshipType: true, bookings: true },
    })
  }

  async removeSponsorshipAssignment(eventId: number, sponsorshipTypeId: number) {
    const existing = await this.prisma.eventSponsorship.findUnique({
      where: { eventId_sponsorshipTypeId: { eventId, sponsorshipTypeId } },
    })
    if (!existing) throw new NotFoundException('Sponsorship assignment not found')

    return this.prisma.eventSponsorship.delete({
      where: { eventId_sponsorshipTypeId: { eventId, sponsorshipTypeId } },
    })
  }

  /** Delete an EVENT SPONSORSHIP by its ID (also deletes its bookings). */
  async deleteEventSponsorshipById(id: number) {
    const existing = await this.prisma.eventSponsorship.findUnique({ where: { id } })
    if (!existing) throw new NotFoundException('Event sponsorship not found')

    return this.prisma.$transaction(async (tx) => {
      await tx.sponsorshipBooking.deleteMany({ where: { eventSponsorshipId: id } })
      return tx.eventSponsorship.delete({ where: { id } })
    })
  }

  /* ───────────────────────── bookings ───────────────────────── */

  async getAllBookings() {
    return this.prisma.sponsorshipBooking.findMany({
      orderBy: { bookedAt: 'desc' },
      include: {
        eventSponsorship: { include: { sponsorshipType: true, event: true } },
      },
    })
  }

  async book(dto: CreateSponsorshipBookingDto, userId?: number) {
    const { eventSponsorshipId } = dto
    const row = await this.prisma.eventSponsorship.findUnique({
      where: { id: eventSponsorshipId },
      include: { bookings: true, sponsorshipType: true },
    })
    if (!row) throw new NotFoundException('Event sponsorship not found')

    // slots guard
    const max = row.maxSlots ?? row.sponsorshipType?.defaultMaxSlots ?? 0
    if ((row.bookings?.length ?? 0) >= max) {
      throw new BadRequestException('Sponsorship slots are full')
    }

    const booking = await this.prisma.sponsorshipBooking.create({
      data: {
        eventSponsorshipId,
        userId: userId ?? null,
        sponsorName: dto.sponsorName,
        sponsorEmail: dto.sponsorEmail,
        sponsorPhone: dto.sponsorPhone,
      },
    })

    await this.notifications.sendSponsorshipBooked(booking.id)
    return booking
  }

  async updateBooking(id: number, dto: UpdateSponsorshipBookingDto) {
    const existing = await this.prisma.sponsorshipBooking.findUnique({ where: { id } })
    if (!existing) throw new NotFoundException('Booking not found')

    return this.prisma.sponsorshipBooking.update({
      where: { id },
      data: {
        ...(dto.sponsorName !== undefined && { sponsorName: dto.sponsorName }),
        ...(dto.sponsorEmail !== undefined && { sponsorEmail: dto.sponsorEmail }),
        ...(dto.sponsorPhone !== undefined && { sponsorPhone: dto.sponsorPhone }),
        // status update omitted unless your DTO allows it
      },
      include: {
        eventSponsorship: { include: { sponsorshipType: true, event: true } },
      },
    })
  }

  /** BOOKING DELETE — by ID */
  async deleteBooking(id: number) {
    const existing = await this.prisma.sponsorshipBooking.findUnique({ where: { id } })
    if (!existing) throw new NotFoundException('Booking not found')
    return this.prisma.sponsorshipBooking.delete({ where: { id } })
  }
}

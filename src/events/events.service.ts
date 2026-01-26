// src/events/events.service.ts

import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common'
import { PrismaService } from '../prisma.service'
import { NotificationsService } from '../notifications/notifications.service'
import { CouponsService } from '../coupons/coupons.service'
import { CreateEventDto } from './dto/create-event.dto'
import { UpdateEventDto } from './dto/update-event.dto'
import { BookEventDto } from './dto/book-event.dto'
import { ValidateKind } from '../coupons/dto/validate-coupon.dto'
import { EventRecurrenceType } from '@prisma/client'
import { DateTime } from 'luxon'
import { TimezoneUtil } from '../common/timezone.util'
import { generateOccurrences } from './event-recurrence.util'

@Injectable()
export class EventsService {
  private readonly logger = new Logger(EventsService.name)
  private readonly tzUtil: TimezoneUtil

  constructor(
    private readonly prisma: PrismaService,
    private readonly notifications: NotificationsService,
    private readonly coupons: CouponsService,
  ) {
    this.tzUtil = new TimezoneUtil(this.prisma)
  }

  /* ───────────────────────── Helpers ───────────────────────── */

  private async ensureEventExists(id: number) {
    const ev = await this.prisma.event.findUnique({ where: { id } })
    if (!ev) throw new NotFoundException(`Event ${id} not found`)
    return ev
  }

  private async buildStartEndUTC(params: {
    occurrenceLocalDay: Date
    startTimeIso?: string
    endTimeIso?: string
  }) {
    const { occurrenceLocalDay, startTimeIso, endTimeIso } = params
    const occDayISO = DateTime.fromJSDate(occurrenceLocalDay).toISODate()

    const getClock = (fallback: string, iso?: string) => {
      if (!iso) return fallback
      const dt = DateTime.fromISO(iso)
      if (!dt.isValid) throw new BadRequestException('Invalid time format')
      return dt.toFormat('HH:mm:ss')
    }

    const startClock = getClock('00:00:00', startTimeIso)
    const endClock = getClock('23:59:59', endTimeIso)

    const startAt = await this.tzUtil.toUTC(`${occDayISO}T${startClock}`)
    const endAt = await this.tzUtil.toUTC(`${occDayISO}T${endClock}`)

    return { startAt, endAt }
  }

  private async createOccurrencesForEvent(params: {
    eventId: number
    recurrenceType: EventRecurrenceType
    recurrenceDays?: number[]
    startDateIso: string
    endDateIso?: string
    startTimeIso?: string
    endTimeIso?: string
    capacity: number | null
  }){
    const {
      eventId,
      recurrenceType,
      recurrenceDays,
      startDateIso,
      endDateIso,
      startTimeIso,
      endTimeIso,
    } = params

    if (
      recurrenceType === EventRecurrenceType.CUSTOM &&
      (!recurrenceDays || !recurrenceDays.length)
    ) {
      throw new BadRequestException('recurrenceDays required for CUSTOM recurrence')
    }

    const startUTC = await this.tzUtil.toUTC(startDateIso)
    const endUTC = endDateIso ? await this.tzUtil.toUTC(endDateIso) : undefined

    const days = generateOccurrences({
      recurrenceType,
      recurrenceDays,
      startDate: startUTC,
      endDate: endUTC,
    })

    if (!days.length) {
      throw new BadRequestException('No occurrences generated')
    }

    const occurrences = []

    for (const day of days) {
      const { startAt, endAt } = await this.buildStartEndUTC({
        occurrenceLocalDay: day,
        startTimeIso,
        endTimeIso,
      })

      const dateISO = DateTime.fromJSDate(day).toISODate()
      const occurrenceDate = await this.tzUtil.toUTC(`${dateISO}T00:00:00`)

      occurrences.push({
        eventId,
        occurrenceDate,
        startAt,
        endAt,
        capacity: params.capacity ?? 0,
        bookedCount: 0,
      })
      
    }

    await this.prisma.eventOccurrence.createMany({
      data: occurrences,
      skipDuplicates: true,
    })
  }

  /* ───────────────────────── CRUD ───────────────────────── */

  async create(dto: CreateEventDto) {
    const inVenue = !!dto.venueId
    const recurrenceType = dto.recurrenceType ?? EventRecurrenceType.NONE

    const event = await this.prisma.event.create({
      data: {
        name: dto.name,
        description: dto.description ?? null,

        venue: !inVenue ? dto.venue ?? null : null,
        mapLink: !inVenue ? dto.mapLink ?? null : null,
        venueRel: inVenue ? { connect: { id: dto.venueId! } } : undefined,

        isInVenue: inVenue,
        isOutsideVenue: !inVenue,

        recurrenceType,
        recurrenceDays: dto.recurrenceDays ?? undefined,

        date: await this.tzUtil.toUTC(dto.date),
        endDate: dto.endDate ? await this.tzUtil.toUTC(dto.endDate) : null,
        startTime: dto.startTime ? await this.tzUtil.toUTC(dto.startTime) : null,
        endTime: dto.endTime ? await this.tzUtil.toUTC(dto.endTime) : null,

        tags: dto.tags ?? undefined,
        capacity: dto.capacity ?? null,
        price: dto.price ?? null,
        organizer: dto.organizer ?? null,
        contactInfo: dto.contactInfo ?? null,
        isPublic: dto.isPublic ?? true,

        ...(dto.featuredMediaId && !dto.clearFeaturedMedia
          ? { featuredMedia: { connect: { id: dto.featuredMediaId } } }
          : {}),
      },
    })

    await this.createOccurrencesForEvent({
      eventId: event.id,
      recurrenceType,
      recurrenceDays: dto.recurrenceDays,
      startDateIso: dto.recurrenceStart ?? dto.date,
      endDateIso: dto.recurrenceEnd,
      startTimeIso: dto.startTime,
      endTimeIso: dto.endTime,
      capacity: dto.capacity ?? 0,
    })
    

    return this.findOne(event.id)
  }

  findAll() {
    return this.prisma.event.findMany({
      orderBy: { date: 'asc' },
      include: {
        featuredMedia: true,
        venueRel: true,
        occurrences: {
          where: { isCancelled: false },
          orderBy: { occurrenceDate: 'asc' },
        },
      },
    })
  }

  async findOne(id: number) {
    await this.ensureEventExists(id)

    return this.prisma.event.findUnique({
      where: { id },
      include: {
        featuredMedia: true,
        venueRel: true,
        gallery: {
          include: { media: true },
          orderBy: { sortOrder: 'asc' },
        },
        occurrences: {
          where: { isCancelled: false },
          orderBy: { occurrenceDate: 'asc' },
        },
      },
    })
  }

  async update(id: number, dto: UpdateEventDto) {
    await this.ensureEventExists(id)
  
    // 1️⃣ Fetch existing event FIRST
    const existing = await this.prisma.event.findUnique({
      where: { id },
    })
  
    if (!existing) {
      throw new NotFoundException('Event not found')
    }
  
    const data: any = {}
  
    // ───────── Basic fields ─────────
    if (dto.name !== undefined) data.name = dto.name
    if (dto.description !== undefined) data.description = dto.description
    if (dto.tags !== undefined) data.tags = dto.tags
    if (dto.capacity !== undefined) data.capacity = dto.capacity
    if (dto.price !== undefined) data.price = dto.price
    if (dto.organizer !== undefined) data.organizer = dto.organizer
    if (dto.contactInfo !== undefined) data.contactInfo = dto.contactInfo
    if (dto.isPublic !== undefined) data.isPublic = dto.isPublic
  
    // ───────── Dates / times ─────────
    if (dto.date !== undefined)
      data.date = await this.tzUtil.toUTC(dto.date)
  
    if (dto.endDate !== undefined)
      data.endDate = dto.endDate
        ? await this.tzUtil.toUTC(dto.endDate)
        : null
  
    if (dto.startTime !== undefined)
      data.startTime = dto.startTime
        ? await this.tzUtil.toUTC(dto.startTime)
        : null
  
    if (dto.endTime !== undefined)
      data.endTime = dto.endTime
        ? await this.tzUtil.toUTC(dto.endTime)
        : null
  
    // ───────── Venue ─────────
    if (dto.venueId !== undefined) {
      data.venueRel = dto.venueId
        ? { connect: { id: dto.venueId } }
        : { disconnect: true }
  
      data.isInVenue = !!dto.venueId
      data.isOutsideVenue = !dto.venueId
    }
  
    // ───────── Recurrence (CRITICAL) ─────────
    if (dto.recurrenceType !== undefined) {
      data.recurrenceType = dto.recurrenceType
    }
  
    if (dto.recurrenceDays !== undefined) {
      data.recurrenceDays =
        dto.recurrenceType === EventRecurrenceType.CUSTOM
          ? dto.recurrenceDays ?? []
          : []
    }
  
    // ───────── Media ─────────
    if (dto.clearFeaturedMedia) {
      data.featuredMedia = { disconnect: true }
    } else if (typeof dto.featuredMediaId === 'number') {
      data.featuredMedia = { connect: { id: dto.featuredMediaId } }
    }
  
    // 2️⃣ Update event row
    await this.prisma.event.update({
      where: { id },
      data,
    })
  
    // 3️⃣ Decide if recurrence needs rebuild
    const recurrenceChanged =
      dto.recurrenceType !== undefined ||
      dto.recurrenceDays !== undefined ||
      dto.date !== undefined ||
      dto.endDate !== undefined ||
      dto.startTime !== undefined ||
      dto.endTime !== undefined
  
    // 4️⃣ Rebuild occurrences IF needed
    if (recurrenceChanged) {
      await this.prisma.eventOccurrence.deleteMany({
        where: { eventId: id },
      })
  
      await this.createOccurrencesForEvent({
        eventId: id,
        recurrenceType: dto.recurrenceType ?? existing.recurrenceType,
        recurrenceDays: dto.recurrenceDays ?? (existing.recurrenceDays as number[] | undefined),
        startDateIso: dto.recurrenceStart ?? dto.date ?? existing.date.toISOString(),
        endDateIso: dto.recurrenceEnd ?? dto.endDate ?? existing.endDate?.toISOString(),
        startTimeIso: dto.startTime ?? existing.startTime?.toISOString(),
        endTimeIso: dto.endTime ?? existing.endTime?.toISOString(),
        capacity: dto.capacity ?? existing.capacity ?? 0,
      })
      
      
    }
  
    // 5️⃣ ALWAYS return full hydrated event
    return this.findOne(id)
  }
  

  

  async remove(id: number) {
    await this.ensureEventExists(id)

    await this.prisma.eventSponsorship.updateMany({
      where: { eventId: id },
      data: { eventId: null },
    })

    await this.prisma.eventMedia.deleteMany({ where: { eventId: id } })

    return this.prisma.event.delete({ where: { id } })
  }




  /* ───────────────────── Bookings ───────────────────── */

  // async bookOccurrenceAsGuest(occurrenceId: number, dto: BookEventDto) {
  //   // 🔒 1️⃣ TRANSACTION — DB ONLY
  //   const booking = await this.prisma.$transaction(async (tx) => {
  //     // Lock occurrence
  //     const occ = await tx.eventOccurrence.findUnique({
  //       where: { id: occurrenceId },
  //       include: { event: true },
  //     })
  
  //     if (!occ || occ.isCancelled) {
  //       throw new BadRequestException('Event occurrence not available')
  //     }
  
  //     const now = new Date()
  //     if (now >= occ.startAt) {
  //       throw new BadRequestException('Booking is closed for this event')
  //     }
  
  //     const pax = Math.max(1, dto.pax)
  
  //     // Capacity check
  //     if (occ.capacity !== null) {
  //       const remaining = occ.capacity - occ.bookedCount
  //       if (remaining <= 0) {
  //         throw new BadRequestException('Event is fully booked')
  //       }
  //       if (pax > remaining) {
  //         throw new BadRequestException(
  //           `Only ${remaining} seat(s) remaining`,
  //         )
  //       }
  //     }
  
  //     // Pricing
  //     const unit = occ.priceOverride ?? occ.event.price ?? 0
  //     const subtotal = pax * unit
  
  //     let discount = 0
  //     let total = subtotal
  //     const code = dto.couponCode?.trim()
  
  //     if (code) {
  //       const quote = await this.coupons.validateAndQuote(code, {
  //         kind: ValidateKind.EVENT,
  //         eventId: occ.eventId,
  //         pax,
  //       })
  
  //       if (!quote.valid) {
  //         throw new BadRequestException(quote.reason)
  //       }
  
  //       discount = quote.discount ?? 0
  //       total = quote.total ?? subtotal - discount
  //     }
  
  //     // Create booking
  //     const booking = await tx.eventBooking.create({
  //       data: {
  //         eventOccurrenceId: occ.id,
  //         eventNameAtBooking: occ.event.name,
  //         eventDateAtBooking: occ.occurrenceDate,
  //         pax,
  //         subtotal,
  //         discountAmount: discount,
  //         total,
  //         userName: dto.userName ?? null,
  //         userEmail: dto.userEmail ?? null,
  //         userPhone: dto.userPhone ?? null,
  //         couponCode: code ?? null,
  //       },
  //     })
  
  //     // Increment seats
  //     await tx.eventOccurrence.update({
  //       where: { id: occ.id },
  //       data: {
  //         bookedCount: { increment: pax },
  //       },
  //     })
  
  //     // Record coupon redemption
  //     if (code && discount > 0) {
  //       await this.coupons.recordRedemption(
  //         {
  //           couponCode: code,
  //           amountApplied: discount,
  //           userId: null,
  //           target: {
  //             type: 'event',
  //             eventBookingId: booking.id,
  //           },
  //         },
  //         tx,
  //       )
  //     }
  
  //     return booking
  //   })
  
  //   // 📧 2️⃣ SIDE EFFECTS — OUTSIDE TRANSACTION
  //   await this.notifications.sendEventBookingCreated(booking.id)
  
  //   return booking
  // }
  async bookOccurrenceAsGuest(occurrenceId: number, dto: BookEventDto) {
    const booking = await this.prisma.$transaction(async (tx) => {
      const occ = await tx.eventOccurrence.findUnique({
        where: { id: occurrenceId },
        include: { event: true },
      })
  
      if (!occ || occ.isCancelled) {
        throw new BadRequestException('Event occurrence not available')
      }
  
      const now = new Date()
      if (now >= occ.startAt) {
        throw new BadRequestException('Booking is closed for this event')
      }
  
      const pax = Math.max(1, dto.pax)
  
      // Capacity check (SOFT CHECK)
      if (occ.capacity !== null) {
        const remaining = occ.capacity - occ.bookedCount
        if (remaining <= 0) {
          throw new BadRequestException('Event is fully booked')
        }
        if (pax > remaining) {
          throw new BadRequestException(`Only ${remaining} seat(s) remaining`)
        }
      }
  
      const unit = occ.priceOverride ?? occ.event.price ?? 0
      const subtotal = pax * unit
  
      let discount = 0
      let total = subtotal
      const code = dto.couponCode?.trim()
  
      if (code) {
        const quote = await this.coupons.validateAndQuote(code, {
          kind: ValidateKind.EVENT,
          eventId: occ.eventId,
          pax,
        })
  
        if (!quote.valid) {
          throw new BadRequestException(quote.reason)
        }
  
        discount = quote.discount ?? 0
        total = quote.total ?? subtotal - discount
      }
  
      // ✅ Create booking as PENDING
      const booking = await tx.eventBooking.create({
        data: {
          eventOccurrenceId: occ.id,
          eventNameAtBooking: occ.event.name,
          eventDateAtBooking: occ.occurrenceDate,
          pax,
          subtotal,
          discountAmount: discount,
          total,
          status: 'PENDING',
          userName: dto.userName ?? null,
          userEmail: dto.userEmail ?? null,
          userPhone: dto.userPhone ?? null,
          couponCode: code ?? null,

        },
      })
  
      return booking
    })
  
    // ❌ No seat increment here
    // ❌ No coupon redemption here
    // ❌ No confirmation notification here
  
    return booking
  }
  
  
  async findBookings(eventId: number) {
    return this.prisma.eventBooking.findMany({
      where: {
        eventOccurrence: {
          eventId,
        },
      },
      include: {
        payment: true, // ✅ THIS IS WHERE IT BELONGS
      },
      orderBy: { bookedAt: 'desc' },
    })
  }
  

  /* ───────────────────── Media helpers ───────────────────── */

  async setFeaturedMedia(eventId: number, mediaId: number | null) {
    await this.ensureEventExists(eventId)

    if (mediaId != null) {
      const exists = await this.prisma.mediaAsset.count({ where: { id: mediaId } })
      if (!exists) throw new BadRequestException('mediaId not found')
    }

    return this.prisma.event.update({
      where: { id: eventId },
      data: { featuredMediaId: mediaId },
      include: {
        featuredMedia: true,
        gallery: { include: { media: true }, orderBy: { sortOrder: 'asc' } },
      },
    })
  }

  async addToGallery(eventId: number, mediaIds: number[]) {
    await this.ensureEventExists(eventId)
    if (!mediaIds?.length) return { ok: true }

    const ids = [...new Set(mediaIds)]
    const count = await this.prisma.mediaAsset.count({ where: { id: { in: ids } } })
    if (count !== ids.length) throw new BadRequestException('Invalid mediaIds')

    const max = await this.prisma.eventMedia.aggregate({
      where: { eventId },
      _max: { sortOrder: true },
    })

    let start = (max._max.sortOrder ?? -1) + 1

    await this.prisma.eventMedia.createMany({
      data: ids.map((mid) => ({ eventId, mediaId: mid, sortOrder: start++ })),
      skipDuplicates: true,
    })

    return this.findOne(eventId)
  }

  async reorderGallery(eventId: number, orders: { mediaId: number; sortOrder: number }[]) {
    await this.ensureEventExists(eventId)

    await this.prisma.eventMedia.deleteMany({ where: { eventId } })

    const data = orders
      .sort((a, b) => a.sortOrder - b.sortOrder)
      .map((o, i) => ({ eventId, mediaId: o.mediaId, sortOrder: i }))

    if (data.length) {
      await this.prisma.eventMedia.createMany({ data })
    }

    return { ok: true }
  }

  async removeFromGallery(eventId: number, mediaId: number) {
    await this.ensureEventExists(eventId)
    await this.prisma.eventMedia.deleteMany({ where: { eventId, mediaId } })
    return { ok: true }
  }
}

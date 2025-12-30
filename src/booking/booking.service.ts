// src/booking/booking.service.ts
import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common'
import { PrismaService } from '../prisma.service'
import { CreateBookingDto } from './dto/create-booking.dto'
import { UpdateBookingDto } from './dto/update-booking.dto'
import { NotificationsService } from '../notifications/notifications.service'
import { TimezoneUtil } from '../common/timezone.util'
import { CouponsService } from '../coupons/coupons.service'
import { ValidateKind } from '../coupons/dto/validate-coupon.dto'
import { DistanceService } from '../common/distance.service'

@Injectable()
export class BookingService {
  private tzUtil: TimezoneUtil

  constructor(
    private prisma: PrismaService,
    private notifications: NotificationsService,
    private coupons: CouponsService,
    private distanceService: DistanceService,
  ) {
    this.tzUtil = new TimezoneUtil(prisma)
  }

  // ─────────────────────────────────────────────
  // SETTINGS (single source of truth)
  // ─────────────────────────────────────────────
  private async getTravelSettings() {
    const settings = await this.prisma.settings.findUnique({
      where: { id: 1 },
      include: { primaryVenue: true }, // ✅ ADD
    })
  
    if (!settings) {
      throw new BadRequestException('Travel settings not configured')
    }
  
    // ✅ ensure primary venue exists + has coordinates
    if (
      !settings.primaryVenue ||
      settings.primaryVenue.latitude == null ||
      settings.primaryVenue.longitude == null
    ) {
      throw new BadRequestException('Primary venue location not configured')
    }
  
    return {
      ratePerUnit: settings.travelRate,      // $ per unit
      freeUnits: settings.freeTravelUnits,   // free units
      maxUnits: settings.maxServiceUnits,    // max units
      unit: settings.travelUnit || 'mile',
  
      // keep this if you want, doesn't affect anything
      avgSpeed: settings.travelAvgSpeed || 25,
  
      // ✅ base coords for calculation
      baseLat: settings.primaryVenue.latitude,
      baseLng: settings.primaryVenue.longitude,
    }
  }
  
  

  // ─────────────────────────────────────────────
  // QUOTE CALCULATION
  // ─────────────────────────────────────────────
  private async calculateQuote(params: {
    poojaId: number
    userId?: number
    venueLat?: number
    venueLng?: number
    couponCode?: string
  }) {
    const pooja = await this.prisma.pooja.findUnique({
      where: { id: params.poojaId },
      include: { venue: true },
    })
  
    if (!pooja || pooja.deletedAt) {
      throw new BadRequestException('Pooja not available')
    }
  
    const settings = await this.getTravelSettings()
  
    let travelDistance: number | null = null
    let travelCost = 0
  
    // --------------------------------------------------
    // 🚗 TRAVEL CALCULATION (ONLY FOR OUTSIDE VENUE)
    // --------------------------------------------------
    if (pooja.isOutsideVenue) {
      if (params.venueLat == null || params.venueLng == null) {
        throw new BadRequestException(
          'Location required for outside venue pooja',
        )
      }
  
      const distanceKm = this.distanceService.getDistanceKm(
        settings.baseLat, // primary venue (global base)
        settings.baseLng,
        params.venueLat,
        params.venueLng,
      )
  
      const distanceMiles = distanceKm * 0.621371
      travelDistance = Number(distanceMiles.toFixed(2))
  
      if (travelDistance > settings.maxUnits) {
        throw new BadRequestException('Outside serviceable area')
      }
  
      const billableUnits = Math.max(
        0,
        travelDistance - settings.freeUnits,
      )
  
      travelCost = Number(
        (billableUnits * settings.ratePerUnit).toFixed(2),
      )
    }
  
    // --------------------------------------------------
    // 💰 BASE AMOUNT (THIS WAS THE BUG)
    // --------------------------------------------------
    if (pooja.isOutsideVenue && pooja.outsideAmount == null) {
      throw new BadRequestException(
        'Outside venue selected but outside amount is not configured',
      )
    }
  
    const baseAmount = pooja.isOutsideVenue
      ? pooja.outsideAmount ?? 0
      : pooja.amount ?? 0
  
    const subtotal = baseAmount + travelCost
  
    // --------------------------------------------------
    // 🎟️ COUPON / DISCOUNT
    // --------------------------------------------------
    let discount = 0
    let total = subtotal
  
    if (params.couponCode) {
      const quote = await this.coupons.validateAndQuote(
        params.couponCode,
        {
          kind: ValidateKind.POOJA,
          poojaId: params.poojaId,
          userId: params.userId,
        },
      )
  
      if (!quote.valid) {
        throw new BadRequestException(
          quote.reason || 'Invalid coupon',
        )
      }
  
      discount = quote.discount ?? 0
      total =
        quote.total ??
        Math.max(0, subtotal - discount)
    }
  
    // --------------------------------------------------
    // 📦 RESPONSE
    // --------------------------------------------------
    return {
      baseAmount,
  
      travelDistanceUnits: travelDistance,
      travelRateApplied: settings.ratePerUnit,
      freeUnits: settings.freeUnits,
  
      travelCost,
      subtotal,
      discount,
      total,
  
      travelUnit: settings.unit,
    }
  }
  

  // ─────────────────────────────────────────────
  // PUBLIC QUOTE
  // ─────────────────────────────────────────────
  async quote(params: {
    poojaId: number
    userId?: number
    venueLat?: number
    venueLng?: number
    couponCode?: string
  }) {
    return this.calculateQuote(params)
  }

  // ─────────────────────────────────────────────
  // CREATE BOOKING
  // ─────────────────────────────────────────────
  async create(dto: CreateBookingDto) {
    const bookingDate = await this.tzUtil.toUTC(dto.bookingDate)
    const start = await this.tzUtil.toUTC(dto.start)
    const end = await this.tzUtil.toUTC(dto.end)

    const pooja = await this.prisma.pooja.findUnique({
      where: { id: dto.poojaId },
      include: { priests: true },
    })
    if (!pooja || pooja.deletedAt) {
      throw new BadRequestException('Pooja not available')
    }

    const priest = await this.prisma.priest.findUnique({
      where: { id: dto.priestId },
    })
    if (!priest) throw new BadRequestException('Priest not found')

    if (!pooja.priests.some(p => p.id === dto.priestId)) {
      throw new BadRequestException(
        'This priest is not assigned to the selected pooja',
      )
    }

    const pricing = await this.calculateQuote({
      poojaId: dto.poojaId,
      userId: dto.userId,
      venueLat: dto.venueLat,
      venueLng: dto.venueLng,
      couponCode: dto.couponCode,
    })

    const created = await this.prisma.booking.create({
      data: {
        userId: dto.userId ?? undefined,
        poojaId: dto.poojaId,
        priestId: dto.priestId,

        bookingDate,
        start,
        end,

        amountAtBooking: pricing.total,
        poojaNameAtBooking: pooja.name,
        priestNameAtBooking: priest.name ?? null,

        userName: dto.userName || null,
        userEmail: dto.userEmail || null,
        userPhone: dto.userPhone || null,
        

        venueAddress: dto.venueAddress ?? undefined,
        venueState: dto.venueState ?? undefined,
        venueZip: dto.venueZip ?? undefined,
        venueLat: dto.venueLat ?? undefined,
        venueLng: dto.venueLng ?? undefined,

        couponCode: dto.couponCode?.trim() || null,
        discountAmount: pricing.discount,
        subtotal: pricing.subtotal,
        total: pricing.total,

        // ✅ SCHEMA-MATCHED FIELDS
        travelDistance: pricing.travelDistanceUnits,
        travelRate: pricing.travelRateApplied,
        freeTravelUnits: pricing.freeUnits,
        travelCost: pricing.travelCost,
        travelUnit: pricing.travelUnit,
        
        // freeTravelUnits: pricing.freeTravelUnits,
      },
    })

    if (dto.couponCode && pricing.discount > 0) {
      await this.coupons.recordRedemption({
        couponCode: dto.couponCode.trim(),
        amountApplied: pricing.discount,
        userId: dto.userId ?? null,
        target: { type: 'pooja', poojaBookingId: created.id },
      })
    }

    await this.notifications.sendBookingCreated(created.id)

    return {
      ...created,
      bookingDate: await this.tzUtil.fromUTC(created.bookingDate),
      start: await this.tzUtil.fromUTC(created.start),
      end: await this.tzUtil.fromUTC(created.end),
    }
  }

  // ─────────────────────────────────────────────
  // READ / UPDATE / DELETE (UNCHANGED)
  // ─────────────────────────────────────────────
  async findAll() {
    const list = await this.prisma.booking.findMany({
      orderBy: { createdAt: 'desc' },
    })
    return Promise.all(
      list.map(async b => ({
        ...b,
        bookingDate: await this.tzUtil.fromUTC(b.bookingDate),
        start: await this.tzUtil.fromUTC(b.start),
        end: await this.tzUtil.fromUTC(b.end),
      })),
    )
  }

  async findAllByPriest(priestId: number) {
    const list = await this.prisma.booking.findMany({
      where: { priestId },
      orderBy: { createdAt: 'desc' },
    })
    return Promise.all(
      list.map(async b => ({
        ...b,
        bookingDate: await this.tzUtil.fromUTC(b.bookingDate),
        start: await this.tzUtil.fromUTC(b.start),
        end: await this.tzUtil.fromUTC(b.end),
      })),
    )
  }


  async findOne(id: number) {
    const b = await this.prisma.booking.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            email: true,   // ✅ only valid field
          },
        },
        pooja: true,
        priest: true,
      },
    })
  
    if (!b) return null
  
    return {
      ...b,
      bookingDate: await this.tzUtil.fromUTC(b.bookingDate),
      start: await this.tzUtil.fromUTC(b.start),
      end: await this.tzUtil.fromUTC(b.end),
    }
  }
  
  

  async update(id: number, dto: UpdateBookingDto) {
    const existing = await this.prisma.booking.findUnique({ where: { id } })
    if (!existing) throw new NotFoundException('Booking not found')

    const data: any = {}

    if (dto.status !== undefined) data.status = dto.status
    if (dto.bookingDate)
      data.bookingDate = await this.tzUtil.toUTC(dto.bookingDate)
    if (dto.start) data.start = await this.tzUtil.toUTC(dto.start)
    if (dto.end) data.end = await this.tzUtil.toUTC(dto.end)

    const updated = await this.prisma.booking.update({
      where: { id },
      data,
    })

    await this.notifications.sendBookingUpdated(updated.id)

    return {
      ...updated,
      bookingDate: await this.tzUtil.fromUTC(updated.bookingDate),
      start: await this.tzUtil.fromUTC(updated.start),
      end: await this.tzUtil.fromUTC(updated.end),
    }
  }

  async remove(id: number) {
    const existing = await this.prisma.booking.findUnique({ where: { id } })
    if (!existing) throw new NotFoundException('Booking not found')

    await this.notifications.sendBookingCanceled(existing.id)
    await this.prisma.booking.delete({ where: { id } })

    return { success: true }
  }
}

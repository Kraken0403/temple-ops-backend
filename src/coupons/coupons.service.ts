import {
  BadRequestException,
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common'
import { PrismaService } from '../prisma.service'
import { Prisma, $Enums, CouponType, RedemptionTargetType } from '@prisma/client'
import { CreateCouponDto } from './dto/create-coupon.dto'
import { UpdateCouponDto } from './dto/update-coupon.dto'
import { ValidateCouponQueryDto, ValidateKind } from './dto/validate-coupon.dto'

@Injectable()
export class CouponsService {
  constructor(private readonly prisma: PrismaService) {}

  /* ─────────────────────────── Helpers ─────────────────────────── */

  private toUTC(d?: string | null) {
    if (!d) return null
    const x = new Date(d)
    return isNaN(+x) ? null : x
  }

  private async setScopes(
    couponId: number,
    dto: { eventIds?: number[]; poojaIds?: number[]; poojaCategoryIds?: number[] },
  ) {
    // “set” behavior: wipe then recreate when arrays provided
    if (dto.eventIds) {
      await this.prisma.couponEvent.deleteMany({ where: { couponId } })
      if (dto.eventIds.length) {
        await this.prisma.couponEvent.createMany({
          data: dto.eventIds.map((eventId) => ({ couponId, eventId })),
          skipDuplicates: true,
        })
      }
    }
    if (dto.poojaIds) {
      await this.prisma.couponPooja.deleteMany({ where: { couponId } })
      if (dto.poojaIds.length) {
        await this.prisma.couponPooja.createMany({
          data: dto.poojaIds.map((poojaId) => ({ couponId, poojaId })),
          skipDuplicates: true,
        })
      }
    }
    if (dto.poojaCategoryIds) {
      await this.prisma.couponPoojaCategory.deleteMany({ where: { couponId } })
      if (dto.poojaCategoryIds.length) {
        await this.prisma.couponPoojaCategory.createMany({
          data: dto.poojaCategoryIds.map((poojaCategoryId) => ({ couponId, poojaCategoryId })),
          skipDuplicates: true,
        })
      }
    }
  }

  /* ───────────────────────────── CRUD ──────────────────────────── */

  async create(dto: CreateCouponDto) {
    const code = dto.code.trim().toUpperCase()

    try {
      const created = await this.prisma.coupon.create({
        data: {
          code,
          description: dto.description ?? null,
          type: dto.type as $Enums.CouponType,  // enum cast from DTO
          value: dto.value,
          maxDiscount: dto.maxDiscount ?? null,
          minOrderAmount: dto.minOrderAmount ?? null,
          startsAt: this.toUTC(dto.startsAt),
          endsAt: this.toUTC(dto.endsAt),
          isActive: dto.isActive ?? true,
          stackable: dto.stackable ?? false,
          usageLimit: dto.usageLimit ?? null,
          usageLimitPerUser: dto.usageLimitPerUser ?? null,
        },
      })

      await this.setScopes(created.id, dto)
      return this.findOne(created.id)
    } catch (err: unknown) {
      // Handle duplicate code gracefully
      if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2002') {
        throw new ConflictException('Coupon code already exists')
      }
      throw err
    }
  }

  async findAll(params?: {
    page?: number | string
    pageSize?: number | string
    search?: string
    active?: boolean | string
  }) {
    const page = Math.max(1, Number(params?.page ?? 1))
    const pageSize = Math.min(100, Math.max(1, Number(params?.pageSize ?? 20)))
    const skip = (page - 1) * pageSize

    const where: any = {}
    if (params?.active !== undefined) {
      where.isActive = typeof params.active === 'string' ? params.active === 'true' : !!params.active
    }

    const q = (params?.search ?? '').trim()
    if (q) {
      // MySQL: case-insensitive by collation; Prisma doesn't support `mode` for MySQL
      where.OR = [{ code: { contains: q } }, { description: { contains: q } }]
    }

    const [items, total] = await Promise.all([
      this.prisma.coupon.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: pageSize, // must provide when using skip
        include: { _count: { select: { redemptions: true } } },
      }),
      this.prisma.coupon.count({ where }),
    ])

    return {
      items,
      total,
      page,
      pageSize,
      totalPages: Math.max(1, Math.ceil(total / pageSize)),
    }
  }

  async findOne(id: number) {
    const row = await this.prisma.coupon.findUnique({
      where: { id },
      include: {
        events: { include: { event: true } },
        poojas: { include: { pooja: true } },
        poojaCats: { include: { poojaCategory: true } },
        _count: { select: { redemptions: true } },
      },
    })
    if (!row) throw new NotFoundException(`Coupon ${id} not found`)
    return row
  }

  async update(id: number, dto: UpdateCouponDto) {
    await this.findOne(id) // 404 if not found

    try {
      await this.prisma.coupon.update({
        where: { id },
        data: {
          code: dto.code ? dto.code.trim().toUpperCase() : undefined,
          description: dto.description ?? undefined,
          type: (dto.type as $Enums.CouponType | undefined),
          value: dto.value ?? undefined,
          maxDiscount: dto.maxDiscount ?? undefined,
          minOrderAmount: dto.minOrderAmount ?? undefined,
          startsAt: dto.startsAt === undefined ? undefined : this.toUTC(dto.startsAt),
          endsAt: dto.endsAt === undefined ? undefined : this.toUTC(dto.endsAt),
          isActive: dto.isActive ?? undefined,
          stackable: dto.stackable ?? undefined,
          usageLimit: dto.usageLimit ?? undefined,
          usageLimitPerUser: dto.usageLimitPerUser ?? undefined,
        },
      })
    } catch (err: unknown) {
      if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2002') {
        throw new ConflictException('Coupon code already exists')
      }
      throw err
    }

    await this.setScopes(id, dto)
    return this.findOne(id)
  }

  async remove(id: number) {
    await this.findOne(id)
    await this.prisma.coupon.delete({ where: { id } })
    return { ok: true }
  }

  /* ─────────── Validate & Quote (public, used in checkout) ─────────── */

  async validateAndQuote(codeRaw: string, q: ValidateCouponQueryDto) {
    const code = (codeRaw || '').trim().toUpperCase()
    if (!code) throw new BadRequestException('Missing coupon code')

    const coupon = await this.prisma.coupon.findUnique({
      where: { code },
      include: { events: true, poojas: true, poojaCats: true },
    })
    if (!coupon || !coupon.isActive) return { valid: false, reason: 'Coupon not found or inactive' }

    const now = new Date()
    if (coupon.startsAt && now < coupon.startsAt) return { valid: false, reason: 'Not started yet' }
    if (coupon.endsAt && now > coupon.endsAt) return { valid: false, reason: 'Coupon expired' }

    let subtotal = 0
    let scopeOK = false

    if (q.kind === ValidateKind.EVENT) {
      const id = Number(q.eventId)
      const pax = Math.max(1, Number(q.pax || 1))
      const ev = await this.prisma.event.findUnique({ where: { id } })
      if (!ev) return { valid: false, reason: 'Event not found' }
      subtotal = (ev.price ?? 0) * pax
      const allowed = new Set(coupon.events.map((e) => e.eventId))
      scopeOK = allowed.size === 0 || allowed.has(id)
    } else {
      const id = Number(q.poojaId)
      const pj = await this.prisma.pooja.findUnique({
        where: { id },
        include: { categories: true },
      })
      if (!pj) return { valid: false, reason: 'Pooja not found' }
      subtotal = pj.amount ?? 0
      const allowedPooja = new Set(coupon.poojas.map((p) => p.poojaId))
      const allowedCats = new Set(coupon.poojaCats.map((c) => c.poojaCategoryId))
      const pjCats = new Set((pj.categories || []).map((c) => c.id))
      scopeOK =
        (allowedPooja.size === 0 && allowedCats.size === 0) ||
        allowedPooja.has(id) ||
        [...pjCats].some((x) => allowedCats.has(x))
    }

    if (!scopeOK) return { valid: false, reason: 'Coupon not applicable' }
    if (coupon.minOrderAmount != null && subtotal < coupon.minOrderAmount) {
      return { valid: false, reason: `Minimum order ${coupon.minOrderAmount} not met` }
    }

    const totalUsed = await this.prisma.couponRedemption.count({ where: { couponId: coupon.id } })
    if (coupon.usageLimit != null && totalUsed >= coupon.usageLimit) {
      return { valid: false, reason: 'Usage limit reached' }
    }

    if (q.userId && coupon.usageLimitPerUser != null) {
      const usedByUser = await this.prisma.couponRedemption.count({
        where: { couponId: coupon.id, userId: Number(q.userId) },
      })
      if (usedByUser >= coupon.usageLimitPerUser) {
        return { valid: false, reason: 'You have used this coupon the maximum number of times' }
      }
    }

    // discount
    let discount = 0
    if (coupon.type === CouponType.PERCENT) {
      discount = (subtotal * coupon.value) / 100
      if (coupon.maxDiscount != null) discount = Math.min(discount, coupon.maxDiscount)
    } else {
      discount = coupon.value
    }
    discount = Math.max(0, Math.min(discount, subtotal))
    const total = Math.max(0, subtotal - discount)

    return { valid: true, subtotal, discount, total }
  }

  /* ─────────────── Redemption recording (after booking) ─────────────── */

  async recordRedemption(opts: {
    couponCode: string
    amountApplied: number
    userId?: number | null
    target: { type: 'event'; eventBookingId: number } | { type: 'pooja'; poojaBookingId: number }
  }) {
    const code = (opts.couponCode || '').trim().toUpperCase()
    if (!code) return

    const coupon = await this.prisma.coupon.findUnique({ where: { code } })
    if (!coupon) return

    if (opts.target.type === 'event') {
      await this.prisma.couponRedemption.create({
        data: {
          couponId: coupon.id,
          userId: opts.userId ?? null,
          targetType: RedemptionTargetType.EVENT_BOOKING,
          eventBookingId: opts.target.eventBookingId,
          amountApplied: opts.amountApplied,
        },
      })
    } else {
      await this.prisma.couponRedemption.create({
        data: {
          couponId: coupon.id,
          userId: opts.userId ?? null,
          targetType: RedemptionTargetType.POOJA_BOOKING,
          poojaBookingId: opts.target.poojaBookingId,
          amountApplied: opts.amountApplied,
        },
      })
    }
  }
}

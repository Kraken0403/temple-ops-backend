// src/booking/booking.service.ts
import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common'
import { PrismaService } from '../prisma.service'
import { CreateBookingDto } from './dto/create-booking.dto'
import { UpdateBookingDto } from './dto/update-booking.dto'
import { NotificationsService } from '../notifications/notifications.service'

@Injectable()
export class BookingService {
  constructor(
    private prisma: PrismaService,
    private notifications: NotificationsService,
  ) {}

  // ✅ Create a booking (snapshot immutable facts)
  async create(dto: CreateBookingDto) {
    const pooja = await this.prisma.pooja.findUnique({
      where: { id: dto.poojaId },
      include: { priests: true },
    })
    if (!pooja) throw new BadRequestException('Pooja not found')
    if (pooja.deletedAt) {
      throw new BadRequestException('This pooja is no longer available')
    }

    const priest = await this.prisma.priest.findUnique({
      where: { id: dto.priestId },
    })
    if (!priest) throw new BadRequestException('Priest not found')

    const isAssignedPriest = pooja.priests.some(p => p.id === dto.priestId)
    if (!isAssignedPriest) {
      throw new BadRequestException('This priest is not assigned to the selected pooja')
    }

    const created = await this.prisma.booking.create({
      data: {
        userId:       dto.userId ?? undefined,
        poojaId:      dto.poojaId,
        priestId:     dto.priestId,

        bookingDate:  new Date(dto.bookingDate),
        start:        new Date(dto.start),
        end:          new Date(dto.end),

        // 🔒 snapshots (do not depend on live pooja/priest later)
        amountAtBooking:     pooja.amount,
        poojaNameAtBooking:  pooja.name,
        priestNameAtBooking: priest.name ?? null,

        // optional user/venue fields
        userName:     dto.userName ?? undefined,
        userEmail:    dto.userEmail ?? undefined,
        userPhone:    dto.userPhone ?? undefined,
        venueAddress: dto.venueAddress ?? undefined,
        venueState:   dto.venueState ?? undefined,
        venueZip:     dto.venueZip ?? undefined,
      },
      include: {
        pooja:  { select: { id: true, name: true } }, // sanitized
        priest: { select: { id: true, name: true } },
      },
    })

    // 🔔 Fire-and-forget email (service handles/logs failures)
    await this.notifications.sendBookingCreated(created.id)

    return created
  }

  // ✅ List (sanitized relations to avoid leaking live price)
  async findAll() {
    return this.prisma.booking.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        pooja:  { select: { id: true, name: true } },
        priest: { select: { id: true, name: true } },
      },
    })
  }

  // ✅ Get single (sanitized)
  async findOne(id: number) {
    return this.prisma.booking.findUnique({
      where: { id },
      include: {
        pooja:  { select: { id: true, name: true } },
        priest: { select: { id: true, name: true } },
      },
    })
  }

  // ✅ Update; refresh snapshots only when pooja/priest changes; notify on success
  async update(id: number, dto: UpdateBookingDto) {
    const existing = await this.prisma.booking.findUnique({
      where: { id },
      include: { pooja: { include: { priests: true } }, priest: true },
    })
    if (!existing) throw new NotFoundException('Booking not found')

    const data: any = {}
    let newPoojaId  = existing.poojaId
    let newPriestId = existing.priestId

    // Handle potential pooja change
    if (dto.poojaId !== undefined) {
      const pooja = await this.prisma.pooja.findUnique({
        where: { id: dto.poojaId },
        include: { priests: true },
      })
      if (!pooja) throw new BadRequestException('Pooja not found')
      data.poojaId = dto.poojaId
      newPoojaId   = dto.poojaId
    }

    // Handle potential priest change
    if (dto.priestId !== undefined) {
      const priest = await this.prisma.priest.findUnique({ where: { id: dto.priestId } })
      if (!priest) throw new BadRequestException('Priest not found')
      data.priestId = dto.priestId
      newPriestId   = dto.priestId
    }

    // If either changed, validate new pairing and refresh snapshots
    if (dto.poojaId !== undefined || dto.priestId !== undefined) {
      const poojaForCheck = await this.prisma.pooja.findUnique({
        where: { id: newPoojaId },
        include: { priests: { select: { id: true } } },
      })
      const isAssigned = poojaForCheck?.priests?.some(p => p.id === newPriestId)
      if (!isAssigned) {
        throw new BadRequestException('This priest is not assigned to the selected pooja')
      }

      const newPooja  = await this.prisma.pooja.findUnique({ where: { id: newPoojaId } })
      const newPriest = await this.prisma.priest.findUnique({ where: { id: newPriestId } })

      data.amountAtBooking     = newPooja?.amount
      data.poojaNameAtBooking  = newPooja?.name ?? existing.poojaNameAtBooking
      data.priestNameAtBooking = newPriest?.name ?? existing.priestNameAtBooking
    }

    // Standard field updates
    if (dto.bookingDate !== undefined) data.bookingDate = new Date(dto.bookingDate)
    if (dto.start !== undefined)       data.start       = new Date(dto.start)
    if (dto.end !== undefined)         data.end         = new Date(dto.end)

    if (dto.userId !== undefined)        data.userId        = dto.userId
    if (dto.userName !== undefined)      data.userName      = dto.userName
    if (dto.userEmail !== undefined)     data.userEmail     = dto.userEmail
    if (dto.userPhone !== undefined)     data.userPhone     = dto.userPhone
    if (dto.venueAddress !== undefined)  data.venueAddress  = dto.venueAddress
    if (dto.venueState !== undefined)    data.venueState    = dto.venueState
    if (dto.venueZip !== undefined)      data.venueZip      = dto.venueZip
    if (dto.status !== undefined)        data.status        = dto.status

    const updated = await this.prisma.booking.update({
      where: { id },
      data,
      include: {
        pooja:  { select: { id: true, name: true } }, // sanitized
        priest: { select: { id: true, name: true } },
      },
    })

    // 🔔 Notify on update
    await this.notifications.sendBookingUpdated(updated.id)

    return updated
  }

  // ✅ Delete (hard-delete). Consider soft-cancel in future.
  async remove(id: number) {
    const existing = await this.prisma.booking.findUnique({ where: { id } })
    if (!existing) throw new NotFoundException('Booking not found')

    await this.notifications.sendBookingCanceled(existing.id)

    try {
      await this.prisma.booking.delete({ where: { id } })
      return { success: true }
    } catch (e: any) {
      if (e?.code === 'P2025') throw new NotFoundException('Booking not found')
      throw e
    }
  }
}

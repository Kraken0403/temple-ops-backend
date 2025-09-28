// src/booking/booking.service.ts
import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common'
import { PrismaService } from '../prisma.service'
import { CreateBookingDto } from './dto/create-booking.dto'
import { UpdateBookingDto } from './dto/update-booking.dto'
import { NotificationsService } from '../notifications/notifications.service'
import { TimezoneUtil } from '../common/timezone.util'

@Injectable()
export class BookingService {
  private tzUtil: TimezoneUtil

  constructor(
    private prisma: PrismaService,
    private notifications: NotificationsService,
  ) {
    this.tzUtil = new TimezoneUtil(prisma)
  }

  // ✅ Create a booking (snapshot immutable facts)
// ✅ Create
async create(dto: CreateBookingDto) {
  const bookingDate = await this.tzUtil.toUTC(dto.bookingDate)
  const start       = await this.tzUtil.toUTC(dto.start)
  const end         = await this.tzUtil.toUTC(dto.end)

  const pooja = await this.prisma.pooja.findUnique({
    where: { id: dto.poojaId },
    include: { priests: true },
  })
  if (!pooja) throw new BadRequestException('Pooja not found')
  if (pooja.deletedAt) throw new BadRequestException('This pooja is no longer available')

  const priest = await this.prisma.priest.findUnique({ where: { id: dto.priestId } })
  if (!priest) throw new BadRequestException('Priest not found')

  const isAssignedPriest = pooja.priests.some(p => p.id === dto.priestId)
  if (!isAssignedPriest) throw new BadRequestException('This priest is not assigned to the selected pooja')

  const created = await this.prisma.booking.create({
    data: {
      userId:       dto.userId ?? undefined,
      poojaId:      dto.poojaId,
      priestId:     dto.priestId,

      bookingDate,
      start,
      end,

      // snapshots
      amountAtBooking:     pooja.amount,
      poojaNameAtBooking:  pooja.name,
      priestNameAtBooking: priest.name ?? null,

      // optional fields
      userName:     dto.userName ?? undefined,
      userEmail:    dto.userEmail ?? undefined,
      userPhone:    dto.userPhone ?? undefined,
      venueAddress: dto.venueAddress ?? undefined,
      venueState:   dto.venueState ?? undefined,
      venueZip:     dto.venueZip ?? undefined,
    },
    include: {
      pooja:  { select: { id: true, name: true } },
      priest: { select: { id: true, name: true } },
    },
  })

  await this.notifications.sendBookingCreated(created.id)

  return {
    ...created,
    bookingDate: await this.tzUtil.fromUTC(created.bookingDate),
    start:       await this.tzUtil.fromUTC(created.start),
    end:         await this.tzUtil.fromUTC(created.end),
  }
}

// ✅ Find all
async findAll() {
  const list = await this.prisma.booking.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      pooja:  { select: { id: true, name: true } },
      priest: { select: { id: true, name: true } },
    },
  })

  return Promise.all(list.map(async b => ({
    ...b,
    bookingDate: await this.tzUtil.fromUTC(b.bookingDate),
    start:       await this.tzUtil.fromUTC(b.start),
    end:         await this.tzUtil.fromUTC(b.end),
  })))
}

// ✅ Find one
async findOne(id: number) {
  const b = await this.prisma.booking.findUnique({
    where: { id },
    include: {
      pooja:  { select: { id: true, name: true } },
      priest: { select: { id: true, name: true } },
    },
  })
  if (!b) return null

  return {
    ...b,
    bookingDate: await this.tzUtil.fromUTC(b.bookingDate),
    start:       await this.tzUtil.fromUTC(b.start),
    end:         await this.tzUtil.fromUTC(b.end),
  }
}

// ✅ Update
async update(id: number, dto: UpdateBookingDto) {
  const existing = await this.prisma.booking.findUnique({
    where: { id },
    include: { pooja: { include: { priests: true } }, priest: true },
  })
  if (!existing) throw new NotFoundException('Booking not found')

  const data: any = {}
  let newPoojaId  = existing.poojaId
  let newPriestId = existing.priestId

  // potential pooja change
  if (dto.poojaId !== undefined) {
    const pooja = await this.prisma.pooja.findUnique({
      where: { id: dto.poojaId },
      include: { priests: true },
    })
    if (!pooja) throw new BadRequestException('Pooja not found')
    data.poojaId = dto.poojaId
    newPoojaId   = dto.poojaId
  }

  // potential priest change
  if (dto.priestId !== undefined) {
    const priest = await this.prisma.priest.findUnique({ where: { id: dto.priestId } })
    if (!priest) throw new BadRequestException('Priest not found')
    data.priestId = dto.priestId
    newPriestId   = dto.priestId
  }

  // validate pair if changed
  if (dto.poojaId !== undefined || dto.priestId !== undefined) {
    const poojaForCheck = await this.prisma.pooja.findUnique({
      where: { id: newPoojaId },
      include: { priests: { select: { id: true } } },
    })
    const isAssigned = poojaForCheck?.priests?.some(p => p.id === newPriestId)
    if (!isAssigned) {
      throw new BadRequestException(`Priest ${newPriestId} is not assigned to pooja ${newPoojaId}`)
    }

    const newPooja  = await this.prisma.pooja.findUnique({ where: { id: newPoojaId } })
    const newPriest = await this.prisma.priest.findUnique({ where: { id: newPriestId } })

    data.amountAtBooking     = newPooja?.amount
    data.poojaNameAtBooking  = newPooja?.name ?? existing.poojaNameAtBooking
    data.priestNameAtBooking = newPriest?.name ?? existing.priestNameAtBooking
  }

  // timezone-aware updates
  if (dto.bookingDate !== undefined) data.bookingDate = await this.tzUtil.toUTC(dto.bookingDate)
  if (dto.start !== undefined)       data.start       = await this.tzUtil.toUTC(dto.start)
  if (dto.end !== undefined)         data.end         = await this.tzUtil.toUTC(dto.end)

  // standard fields
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
      pooja:  { select: { id: true, name: true } },
      priest: { select: { id: true, name: true } },
    },
  })

  await this.notifications.sendBookingUpdated(updated.id)

  return {
    ...updated,
    bookingDate: await this.tzUtil.fromUTC(updated.bookingDate),
    start:       await this.tzUtil.fromUTC(updated.start),
    end:         await this.tzUtil.fromUTC(updated.end),
  }
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

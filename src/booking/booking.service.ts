import { Injectable, BadRequestException } from '@nestjs/common'
import { PrismaService } from '../prisma.service'
import { CreateBookingDto } from './dto/create-booking.dto'

@Injectable()
export class BookingService {
  constructor(private prisma: PrismaService) {}

  // ✅ Create a booking
  async create(dto: CreateBookingDto) {
    const pooja = await this.prisma.pooja.findUnique({
      where: { id: dto.poojaId },
      include: { priests: true }
    })

    if (!pooja) {
      throw new BadRequestException('Pooja not found')
    }

    const priest = await this.prisma.priest.findUnique({
      where: { id: dto.priestId }
    })

    if (!priest) {
      throw new BadRequestException('Priest not found')
    }

    const isAssignedPriest = pooja.priests.some(p => p.id === dto.priestId)
    if (!isAssignedPriest) {
      throw new BadRequestException('This priest is not assigned to the selected pooja')
    }

    return this.prisma.booking.create({
      data: {
        userId:       dto.userId ?? undefined,
        poojaId:      dto.poojaId,
        priestId:     dto.priestId,
        bookingDate: new Date(dto.bookingDate),
        start:       new Date(dto.start),
        end:         new Date(dto.end),
        userName:     dto.userName ?? undefined,
        userEmail:    dto.userEmail ?? undefined,
        userPhone:    dto.userPhone ?? undefined,
        venueAddress: dto.venueAddress ?? undefined,
        venueState:   dto.venueState ?? undefined,
        venueZip:     dto.venueZip ?? undefined,
      }
    })
  }

  // ✅ Get all bookings (admin listing)
  async findAll() {
    return this.prisma.booking.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        pooja: true,
        priest: true
      }
    })
  }

  // ✅ Get single booking by ID
  // booking.service.ts
  async findOne(id: number) {
    return this.prisma.booking.findUnique({
      where: { id },
      include: {
        pooja: true,
        priest: true
      }
    })
  }

}

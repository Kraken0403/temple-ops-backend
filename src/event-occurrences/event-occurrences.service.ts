import { Injectable, NotFoundException } from '@nestjs/common'
import { PrismaService } from '../prisma.service'

@Injectable()
export class EventOccurrencesService {
  constructor(private readonly prisma: PrismaService) {}

  async getBookings(occurrenceId: number) {
    const occurrence = await this.prisma.eventOccurrence.findUnique({
      where: { id: occurrenceId },
    })

    if (!occurrence) {
      throw new NotFoundException('Event occurrence not found')
    }

    return this.prisma.eventBooking.findMany({
        where: {
          eventOccurrenceId: occurrenceId,
        },
        orderBy: {
          bookedAt: 'desc',
        },
        include: {
          payment: true,
          eventOccurrence: true,
        },
      })
      
      
  }
}

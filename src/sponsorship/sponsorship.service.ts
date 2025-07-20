// src/sponsorship/sponsorship.service.ts
import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { CreateSponsorshipTypeDto } from './dto/create-sponsorship-type.dto';
import { CreateEventSponsorshipDto } from './dto/create-event-sponsorship.dto';
import { CreateSponsorshipBookingDto } from './dto/create-sponsorship-booking.dto';

@Injectable()
export class SponsorshipService {
  constructor(private readonly prisma: PrismaService) {}

  // 1. Create a sponsorship type
  async createType(dto: CreateSponsorshipTypeDto) {
    return this.prisma.sponsorshipType.create({
      data: {
        name:        dto.name,
        description: dto.description,
        price:       dto.price
      }
    });
  }

  // 2. Assign sponsorship type to an event
  // sponsorship.service.ts
// sponsorship.service.ts
async assignToEvent(dto: CreateEventSponsorshipDto) {
  const { eventId, sponsorshipTypeId, maxSlots, price } = dto

  const sponsorshipType = await this.prisma.sponsorshipType.findUnique({
    where: { id: sponsorshipTypeId }
  })

  if (!sponsorshipType) {
    throw new Error(`Sponsorship type with ID ${sponsorshipTypeId} not found`)
  }

  const finalPrice = price ?? sponsorshipType.price

  return this.prisma.eventSponsorship.upsert({
    where: {
      eventId_sponsorshipTypeId: {
        eventId,
        sponsorshipTypeId
      }
    },
    update: {
      maxSlots,
      price: finalPrice
    },
    create: {
      eventId,
      sponsorshipTypeId,
      maxSlots,
      price: finalPrice
    }
  })
}




async getAllBookings() {
    return this.prisma.sponsorshipBooking.findMany({
    orderBy: { bookedAt: 'desc' },
    include: {
        eventSponsorship: {
        include: {
            sponsorshipType: true,
            event: true
        }
        }
    }
    })
}

async getEventSponsorshipById(id: number) {
    return this.prisma.eventSponsorship.findUnique({
      where: { id },
      include: {
        event: true,
        sponsorshipType: true,
        bookings: true, // optional: to calculate slots filled
      },
    });
  }
  
  
async getAllEventSponsorships() {
    return this.prisma.eventSponsorship.findMany({
      include: {
        sponsorshipType: true,
        event: true,
        bookings: true // 👈 include this to count bookings
      },
      orderBy: {
        id: 'desc'
      }
    });
  }
  

  // 3. Book a sponsorship slot (for a specific event sponsorship)
  async book(dto: CreateSponsorshipBookingDto, userId?: number) {
    const { eventSponsorshipId } = dto;

    const sponsorship = await this.prisma.eventSponsorship.findUnique({
      where: { id: eventSponsorshipId },
      include: { bookings: true }
    });

    if (!sponsorship) throw new NotFoundException('Event sponsorship not found');

    if (sponsorship.bookings.length >= sponsorship.maxSlots) {
      throw new BadRequestException('Sponsorship slots are full');
    }

    return this.prisma.sponsorshipBooking.create({
      data: {
        eventSponsorshipId,
        userId: userId ?? null,
        sponsorName: dto.sponsorName,
        sponsorEmail: dto.sponsorEmail,
        sponsorPhone: dto.sponsorPhone
      }
    });
  }

  // 4. Get all sponsorships for an event
  async getSponsorshipsForEvent(eventId: number) {
    return this.prisma.eventSponsorship.findMany({
      where: { eventId },
      include: {
        sponsorshipType: true,
        bookings: true
      }
    });
  }

  async removeSponsorshipAssignment(eventId: number, sponsorshipTypeId: number) {
    const existing = await this.prisma.eventSponsorship.findUnique({
      where: {
        eventId_sponsorshipTypeId: {
          eventId,
          sponsorshipTypeId,
        },
      },
    });
  
    if (!existing) {
      throw new NotFoundException('Sponsorship assignment not found');
    }
  
    return this.prisma.eventSponsorship.delete({
      where: {
        eventId_sponsorshipTypeId: {
          eventId,
          sponsorshipTypeId,
        },
      },
    });
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
        _count: {
          select: {
            eventSponsorships: true,
          },
        },
      },
    })
  }

}

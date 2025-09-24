import { Injectable } from '@nestjs/common'
import { PrismaService } from '../prisma.service'
import { CreateVenueDto } from './dto/create-venue.dto'
import { UpdateVenueDto } from './dto/update-venue.dto'

@Injectable()
export class VenuesService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.venue.findMany({
      orderBy: { createdAt: 'desc' }
    })
  }

  async findOne(id: number) {
    return this.prisma.venue.findUnique({ where: { id } })
  }

  async create(data: CreateVenueDto) {
    return this.prisma.venue.create({ data })
  }

  async update(id: number, data: UpdateVenueDto) {
    return this.prisma.venue.update({ where: { id }, data })
  }

  async remove(id: number) {
    return this.prisma.venue.delete({ where: { id } })
  }
}

// src/donations/donation-item.service.ts
import { Injectable } from '@nestjs/common'
import { PrismaService } from '../prisma.service'
import { CreateDonationItemDto } from './dto/create-donation-item.dto'
import { UpdateDonationItemDto } from './dto/update-donation-item.dto'

@Injectable()
export class DonationItemService {
  constructor(private prisma: PrismaService) {}

  create(dto: CreateDonationItemDto) {
    return this.prisma.donationItem.create({ data: dto })
  }

  findAll() {
    return this.prisma.donationItem.findMany()
  }

  findOne(id: number) {
    return this.prisma.donationItem.findUnique({ where: { id } })
  }

  update(id: number, dto: UpdateDonationItemDto) {
    return this.prisma.donationItem.update({
      where: { id },
      data: dto
    })
  }

  remove(id: number) {
    return this.prisma.donationItem.delete({ where: { id } })
  }
}

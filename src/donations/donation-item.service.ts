// src/donations/donation-item.service.ts
import { Injectable, BadRequestException } from '@nestjs/common'
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
    return this.prisma.donationItem.findMany({
      orderBy: { updatedAt: 'desc' }
    })
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

  async remove(id: number) {
    const count = await this.prisma.donationRecord.count({
      where: { donationItemId: id }
    })
    if (count > 0) {
      // Choose your policy:
      // 1) Block delete:
      throw new BadRequestException(
        'Cannot delete: donation records exist for this item'
      )

      // 2) Or cascade delete (dangerous, uncomment if you want):
      // await this.prisma.donationRecord.deleteMany({ where: { donationItemId: id } })
    }

    return this.prisma.donationItem.delete({ where: { id } })
  }
}

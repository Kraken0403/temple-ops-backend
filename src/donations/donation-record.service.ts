// src/donations/donation-record.service.ts
import { Injectable } from '@nestjs/common'
import { PrismaService } from '../prisma.service'
import { CreateDonationRecordDto } from './dto/create-donation-record.dto'

@Injectable()
export class DonationRecordService {
  constructor(private prisma: PrismaService) {}

  create(dto: CreateDonationRecordDto) {
    return this.prisma.donationRecord.create({
      data: {
        donationItemId: dto.donationItemId,
        donorName:      dto.donorName,
        donorEmail:     dto.donorEmail,
        donorPhone:     dto.donorPhone
      }
    })
  }

  findAll() {
    return this.prisma.donationRecord.findMany({
      include: { donationItem: true }
    })
  }

  findOne(id: number) {
    return this.prisma.donationRecord.findUnique({
      where: { id },
      include: { donationItem: true }
    })
  }
}

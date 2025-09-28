// src/donations/donation-record.service.ts
import { Injectable, NotFoundException } from '@nestjs/common'
import { PrismaService } from '../prisma.service'
import { CreateDonationRecordDto } from './dto/create-donation-record.dto'
import { UpdateDonationRecordDto } from './dto/update-donation-record.dto'
import { NotificationsService } from '../notifications/notifications.service' 
@Injectable()
export class DonationRecordService {
  constructor(
    private prisma: PrismaService,
    private notifications: NotificationsService,
  ) {}

  async create(dto: CreateDonationRecordDto) {
    const item = await this.ensureItem(dto.donationItemId)

    const donation = await this.prisma.donationRecord.create({
      data: {
        donationItemId:     dto.donationItemId,
        donorName:          dto.donorName,
        donorEmail:         dto.donorEmail,
        donorPhone:         dto.donorPhone,
        amountAtDonation:   item.amount, // snapshot
        itemNameAtDonation: item.name,   // snapshot
      },
      include: { donationItem: true },
    });

    // 👇 send email notification
    await this.notifications.sendDonationReceived(donation.id);

    return donation;
  }

  findAll() {
    return this.prisma.donationRecord.findMany({
      include: { donationItem: true },
      orderBy: { createdAt: 'desc' },
    })
  }

  async findOne(id: number) {
    const rec = await this.prisma.donationRecord.findUnique({
      where: { id },
      include: { donationItem: true },
    })
    if (!rec) throw new NotFoundException('Donation record not found')
    return rec
  }

  async update(id: number, dto: UpdateDonationRecordDto) {
    await this.findOne(id) // ensures record exists

    const data: any = {
      donorName:  dto.donorName  ?? undefined,
      donorEmail: dto.donorEmail ?? undefined,
      donorPhone: dto.donorPhone ?? undefined,
    }

    // if item changed, resnapshot
    if (dto.donationItemId) {
      const item = await this.ensureItem(dto.donationItemId)
      data.donationItemId = dto.donationItemId
      data.amountAtDonation = item.amount
      data.itemNameAtDonation = item.name
    }

    return this.prisma.donationRecord.update({
      where: { id },
      data,
      include: { donationItem: true },
    })
  }

  async remove(id: number) {
    await this.findOne(id)
    return this.prisma.donationRecord.delete({ where: { id } })
  }

  private async ensureItem(donationItemId: number) {
    const item = await this.prisma.donationItem.findUnique({
      where: { id: donationItemId },
    })
    if (!item) throw new NotFoundException('Donation item not found')
    return item
  }
}

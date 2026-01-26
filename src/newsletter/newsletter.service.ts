import { Injectable, BadRequestException } from '@nestjs/common'
import { PrismaService } from '../prisma.service'
import { SubscribeNewsletterDto } from './dto/subscribe-newsletter.dto'
import { SubscriberStatus } from '@prisma/client'

@Injectable()
export class NewsletterService {
  constructor(private readonly prisma: PrismaService) {}

  // -------------------------------
  // Public subscribe
  // -------------------------------
  async subscribe(dto: SubscribeNewsletterDto) {
    const email = dto.email.toLowerCase().trim()

    const existing = await this.prisma.newsletterSubscriber.findUnique({
      where: { email },
    })

    if (existing) {
      if (existing.status === SubscriberStatus.UNSUBSCRIBED) {
        return this.prisma.newsletterSubscriber.update({
          where: { email },
          data: {
            status: SubscriberStatus.ACTIVE,
            source: dto.source,
          },
        })
      }

      throw new BadRequestException('Already subscribed')
    }

    return this.prisma.newsletterSubscriber.create({
      data: {
        email,
        source: dto.source,
      },
    })
  }

  // -------------------------------
  // Admin list
  // -------------------------------
  async listSubscribers() {
    return this.prisma.newsletterSubscriber.findMany({
      orderBy: { createdAt: 'desc' },
    })
  }

  // -------------------------------
  // Admin unsubscribe
  // -------------------------------
  async unsubscribe(id: number) {
    return this.prisma.newsletterSubscriber.update({
      where: { id },
      data: { status: SubscriberStatus.UNSUBSCRIBED },
    })
  }
}

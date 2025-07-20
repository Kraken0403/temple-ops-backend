import { Injectable } from '@nestjs/common'
import { PrismaService } from '../prisma.service'

@Injectable()
export class SettingsService {
  constructor(private readonly prisma: PrismaService) {}

  async getSettings() {
    const settings = await this.prisma.settings.findUnique({
      where: { id: 1 },
    })

    // Fallback default if not set yet
    if (!settings) {
      return { currency: 'INR' }
    }

    return settings
  }

  async updateSettings(data: { currency: string }) {
    // Try to update, create if not exists
    const existing = await this.prisma.settings.findUnique({
      where: { id: 1 },
    })

    if (existing) {
      return this.prisma.settings.update({
        where: { id: 1 },
        data,
      })
    }

    return this.prisma.settings.create({
      data: { id: 1, ...data },
    })
  }
}

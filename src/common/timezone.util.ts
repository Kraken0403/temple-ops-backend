// src/common/timezone.util.ts
import { DateTime } from 'luxon'
import { PrismaService } from '../prisma.service'
import { BadRequestException } from '@nestjs/common'

export class TimezoneUtil {
  constructor(private prisma: PrismaService) {}

  /** Convert incoming local/ISO date to UTC for DB storage */
  async toUTC(date: string | Date | null): Promise<Date> {
    if (!date) throw new BadRequestException('Date is required')

    const settings = await this.prisma.settings.findUnique({ where: { id: 1 } })
    const tz = settings?.timezone || 'Asia/Kolkata'

    let dt: DateTime
    if (typeof date === 'string') {
      dt = DateTime.fromISO(date, { zone: tz })
    } else {
      dt = DateTime.fromJSDate(date, { zone: tz })
    }

    if (!dt.isValid) {
      throw new BadRequestException('Invalid date format')
    }

    return dt.toUTC().toJSDate()
  }

  /** Convert stored UTC back into configured timezone ISO string */
  async fromUTC(date: Date | null): Promise<string | null> {
    if (!date) return null
    const settings = await this.prisma.settings.findUnique({ where: { id: 1 } })
    const tz = settings?.timezone || 'Asia/Kolkata'

    return (
      DateTime.fromJSDate(date, { zone: 'utc' })
        .setZone(tz)
        .toISO() || null
    )
  }

  /** Format for human-readable display (frontend/admin tables) */
  async format(date: Date | null, fmt = 'yyyy-LL-dd HH:mm'): Promise<string | null> {
    if (!date) return null
    const settings = await this.prisma.settings.findUnique({ where: { id: 1 } })
    const tz = settings?.timezone || 'Asia/Kolkata'

    const dt = DateTime.fromJSDate(date, { zone: 'utc' }).setZone(tz)
    return dt.isValid ? dt.toFormat(fmt) : null
  }
}

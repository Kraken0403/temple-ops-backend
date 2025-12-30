// src/settings/settings.service.ts
import { Injectable } from '@nestjs/common'
import { PrismaService } from '../prisma.service'

@Injectable()
export class SettingsService {
  constructor(private readonly prisma: PrismaService) {}

  async getSettings() {
    const settings = await this.prisma.settings.findUnique({
      where: { id: 1 },
      include: {
        primaryVenue: true, // ✅ allow frontend & booking service to see it
      },
    })

    // If settings row doesn't exist, return safe defaults
    if (!settings) {
    return {
      currency: 'USD',
      timezone: 'America/New_York',

      travelRate: 10,
      travelUnit: 'mile',
      freeTravelUnits: 5,
      maxServiceUnits: 50,
      travelAvgSpeed: 25,

      primaryVenueId: null,     // ✅ important
      primaryVenue: null,       // ✅ safe default
    }

    }

    return settings
  }

  async updateSettings(data: {
    currency?: string
    timezone?: string
  
    travelRate?: number
    travelUnit?: string
    freeTravelUnits?: number
    maxServiceUnits?: number
    travelAvgSpeed?: number
  
    primaryVenueId?: number | null // ✅ ADD THIS
  }) {
  
    const existing = await this.prisma.settings.findUnique({
      where: { id: 1 },
    })

    if (existing) {
      return this.prisma.settings.update({
        where: { id: 1 },
        data,
      })
    }

    // Create initial settings row (REQUIRED FIELDS INCLUDED)
    return this.prisma.settings.create({
      data: {
        id: 1,
    
        currency: data.currency ?? 'USD',
        timezone: data.timezone ?? 'America/New_York',
    
        travelRate: data.travelRate ?? 10,
        travelUnit: data.travelUnit ?? 'mile',
        freeTravelUnits: data.freeTravelUnits ?? 5,
        maxServiceUnits: data.maxServiceUnits ?? 50,
        travelAvgSpeed: data.travelAvgSpeed ?? 25,
    
        primaryVenueId: data.primaryVenueId ?? null, // ✅ ADD
      },
    })
    

  }
}

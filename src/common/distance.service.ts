import { Injectable } from '@nestjs/common'

@Injectable()
export class DistanceService {

  /**
   * Returns distance in KM between two lat/lng points
   */
  getDistanceKm(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number,
  ): number {
    const R = 6371 // Earth radius in km

    const dLat = this.deg2rad(lat2 - lat1)
    const dLon = this.deg2rad(lon2 - lon1)

    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.deg2rad(lat1)) *
        Math.cos(this.deg2rad(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2)

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
    return Number((R * c).toFixed(2))
  }

  private deg2rad(deg: number): number {
    return deg * (Math.PI / 180)
  }
}

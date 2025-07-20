import { IsInt, Min, IsNumber } from 'class-validator'

export class CreateEventSponsorshipDto {
  @IsInt()
  eventId!: number

  @IsInt()
  sponsorshipTypeId!: number

  @IsInt()
  @Min(1)
  maxSlots!: number

  @IsNumber()
  @Min(0)
  price?: number  // ✅ Add this
}

// src/sponsorship/dto/create-standalone-sponsorship.dto.ts
import { IsInt, Min, IsNumber, IsOptional, IsDateString, IsBoolean } from 'class-validator'

export class CreateStandaloneSponsorshipDto {
  @IsInt()
  sponsorshipTypeId!: number

  @IsInt()
  @Min(1)
  maxSlots!: number

  @IsNumber()
  @Min(0)
  price?: number

  @IsOptional() @IsDateString()
  startsAt?: string

  @IsOptional() @IsDateString()
  endsAt?: string

  @IsOptional() @IsBoolean()
  isActive?: boolean
}

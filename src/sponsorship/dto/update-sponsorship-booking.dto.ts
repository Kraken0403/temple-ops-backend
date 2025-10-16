// src/sponsorship/dto/update-sponsorship-booking.dto.ts
import { IsOptional, IsString, IsEmail, IsIn } from 'class-validator'

export class UpdateSponsorshipBookingDto {
  @IsOptional()
  @IsString()
  sponsorName?: string

  @IsOptional()
  @IsEmail()
  sponsorEmail?: string

  @IsOptional()
  @IsString()
  sponsorPhone?: string

  // keep this in sync with your Prisma model allowed states
  @IsOptional()
  @IsIn(['pending', 'confirmed', 'failed'])
  status?: string
}

// src/sponsorship/dto/update-sponsorship-booking.dto.ts
import { IsOptional, IsString, IsEmail } from 'class-validator';

export class UpdateSponsorshipBookingDto {
  @IsOptional() @IsString()
  sponsorName?: string;

  @IsOptional() @IsEmail()
  sponsorEmail?: string;

  @IsOptional() @IsString()
  sponsorPhone?: string;
}

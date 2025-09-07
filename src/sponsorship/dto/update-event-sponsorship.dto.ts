// src/sponsorship/dto/update-event-sponsorship.dto.ts
import { IsOptional, IsNumber, Min } from 'class-validator';

export class UpdateEventSponsorshipDto {
  @IsOptional() @IsNumber() @Min(0)
  maxSlots?: number;

  @IsOptional() @IsNumber() @Min(0)
  price?: number;
}

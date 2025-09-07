// src/sponsorship/dto/update-sponsorship-type.dto.ts
import { IsOptional, IsString, IsNumber, Min } from 'class-validator';

export class UpdateSponsorshipTypeDto {
  @IsOptional() @IsString()
  name?: string;

  @IsOptional() @IsString()
  description?: string;

  @IsOptional() @IsNumber() @Min(0)
  price?: number;
}

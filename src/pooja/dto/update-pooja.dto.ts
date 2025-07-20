// src/pooja/dto/update-pooja.dto.ts
import {
  IsString,
  IsNumber,
  IsBoolean,
  IsDateString,
  IsOptional,
  IsArray,
} from 'class-validator';
import { Type } from 'class-transformer';

export class UpdatePoojaDto {
  @IsOptional() @IsString()                     name?: string;

  @IsOptional()
  @IsArray()
  @Type(() => Number)
  @IsNumber({}, { each: true })
                                                priestIds?: number[];

  @IsOptional() @Type(() => Number) @IsNumber() amount?: number;

  @IsOptional() @Type(() => Number) @IsNumber() durationMin?: number;
  @IsOptional() @Type(() => Number) @IsNumber() prepTimeMin?: number;
  @IsOptional() @Type(() => Number) @IsNumber() bufferMin?: number;

  @IsOptional() @Type(() => Boolean) @IsBoolean()    isInVenue?: boolean;
  @IsOptional() @Type(() => Boolean) @IsBoolean()    isOutsideVenue?: boolean;

  @IsOptional() @IsDateString()                   date?: string;
  @IsOptional() @IsDateString()                   time?: string;
  @IsOptional() @IsString()                       venueAddress?: string;
  @IsOptional() @IsString()                       mapLink?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
                                                allowedZones?: string[];

  @IsOptional() @Type(() => Boolean) @IsBoolean() includeFood?: boolean;
  @IsOptional() @Type(() => Boolean) @IsBoolean() includeHall?: boolean;

  @IsOptional() @IsString()                       materials?: string;
  @IsOptional() @IsString()                       notes?: string;

  @IsOptional() @IsString()                       photoUrl?: string;

  // ← NEW FIELD:
  @IsOptional()
  @IsString()
                                                description?: string;
}

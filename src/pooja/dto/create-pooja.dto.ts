// src/pooja/dto/create-pooja.dto.ts

import type { Express } from 'express';
import {
  IsString,
  IsNumber,
  IsBoolean,
  IsDateString,
  IsOptional,
  IsArray,
  ValidateIf,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type }        from 'class-transformer';

export class CreatePoojaDto {
  @IsString()
  name!: string;

  @IsArray()
  @IsNumber({}, { each: true })
  priestIds!: number[];

  @IsNumber()
  @Type(() => Number)
  amount!: number;

  @IsNumber()
  @Type(() => Number)
  durationMin!: number;

  @IsNumber()
  @Type(() => Number)
  prepTimeMin!: number;

  @IsNumber()
  @Type(() => Number)
  bufferMin!: number;

  @IsBoolean()
  @Type(() => Boolean)
  isInVenue!: boolean;

  @IsBoolean()
  @Type(() => Boolean)
  isOutsideVenue!: boolean;

  // in-venue fields
  @ValidateIf(o => o.isInVenue)
  @IsDateString()
  date!: string;

  @ValidateIf(o => o.isInVenue)
  @IsDateString()
  time!: string;

  @ValidateIf(o => o.isInVenue)
  @IsOptional()
  @IsString()
  venueAddress?: string;

  @ValidateIf(o => o.isInVenue)
  @IsOptional()
  @IsString()
  mapLink?: string;

  // outside-venue fields
  @ValidateIf(o => o.isOutsideVenue)
  @IsArray()
  @IsString({ each: true })
  allowedZones?: string[];

  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  includeFood?: boolean;

  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  includeHall?: boolean;

  @IsOptional()
  @IsString()
  materials?: string;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsString()
  @ApiProperty({ description: 'Long description of the pooja', required: false })
  description?: string;

  /**
   * The raw file—Nest’s FileInterceptor will populate this,
   * controller should handle saving and storing the URL.
   */
  @ApiProperty({ type: 'string', format: 'binary', required: false })
  @IsOptional()
  photo?: Express.Multer.File;
}

import {
  IsString,
  IsOptional,
  IsDateString,
  IsBoolean,
  IsInt,
  IsNumber,
  IsArray,
  IsEnum,
} from 'class-validator'
import { Type } from 'class-transformer'
import { EventRecurrenceType } from '@prisma/client'


export class CreateEventDto {
  @IsString() name!: string;

  @IsString() @IsOptional()
  description?: string;

  /** In-venue: select from saved venues */
  @IsOptional() @Type(() => Number) @IsNumber()
  venueId?: number;

  /** Outside-venue: legacy free text + map link */
  @IsString() @IsOptional()
  venue?: string;

  @IsString() @IsOptional()
  mapLink?: string;

  @IsOptional()
  @IsEnum(EventRecurrenceType)
  recurrenceType?: EventRecurrenceType;

  @IsOptional()
  @IsArray()
  @IsInt({ each: true })
  recurrenceDays?: number[]; 

  @IsOptional()
  @IsDateString()
  recurrenceStart?: string;

  @IsOptional()
  @IsDateString()
  recurrenceEnd?: string;


  /** Unified flags (same pattern as Pooja) */
  @IsBoolean() @IsOptional() @Type(() => Boolean)
  isInVenue?: boolean;
  
  @IsBoolean() @IsOptional() @Type(() => Boolean)
  isOutsideVenue?: boolean;  

  @IsDateString() date!: string;
  @IsDateString() @IsOptional() endDate?: string;
  @IsDateString() @IsOptional() startTime?: string;
  @IsDateString() @IsOptional() endTime?: string;

  @IsArray() @IsOptional()
  tags?: string[];

  @IsInt() @IsOptional()
  @Type(() => Number)
  capacity?: number;

  @IsNumber() @IsOptional()
  @Type(() => Number)
  price?: number;

  @IsString() @IsOptional()
  organizer?: string;

  @IsString() @IsOptional()
  contactInfo?: string;

  @IsBoolean() @IsOptional()
  @Type(() => Boolean)
  isPublic?: boolean;

  // unified featured image
  @IsOptional()
  @Type(() => Number)
  featuredMediaId?: number;

  @IsOptional()
  clearFeaturedMedia?: boolean;
}

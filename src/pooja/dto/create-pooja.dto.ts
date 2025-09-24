import {
  IsString, IsNumber, IsBoolean, IsDateString, IsOptional, IsArray
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreatePoojaDto {
  @IsString() name!: string;

  @IsArray() @Type(() => Number) @IsNumber({}, { each: true })
  priestIds!: number[];

  @IsNumber() @Type(() => Number) amount!: number;
  @IsNumber() @Type(() => Number) durationMin!: number;
  @IsNumber() @Type(() => Number) prepTimeMin!: number;
  @IsNumber() @Type(() => Number) bufferMin!: number;

  @IsBoolean() @Type(() => Boolean) isInVenue!: boolean;
  @IsBoolean() @Type(() => Boolean) isOutsideVenue!: boolean;

  /** In-venue: select from saved venues */
  @IsOptional() @Type(() => Number) @IsNumber()
  venueId?: number;

  /** Outside-venue: free text + map link */
  @IsOptional() @IsDateString() date?: string;
  @IsOptional() @IsDateString() time?: string;

  @IsOptional() @IsString() venueAddress?: string;
  @IsOptional() @IsString() mapLink?: string;

  @IsOptional() @IsArray() @IsString({ each: true })
  allowedZones?: string[];

  @IsOptional() @IsBoolean() @Type(() => Boolean)
  includeFood?: boolean;

  @IsOptional() @IsBoolean() @Type(() => Boolean)
  includeHall?: boolean;

  @IsOptional() @IsString()
  materials?: string;

  @IsOptional() @IsString()
  notes?: string;

  @IsOptional() @IsString()
  description?: string;

  @IsArray() @IsOptional() @Type(() => Number)
  categoryIds?: number[];

  // unified featured image
  @IsOptional() @Type(() => Number)
  featuredMediaId?: number;
}

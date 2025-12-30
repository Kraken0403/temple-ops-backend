import { IsString, IsNumber, IsBoolean, IsDateString, IsOptional, IsArray } from 'class-validator';
import { Type } from 'class-transformer';

export class UpdatePoojaDto {
  @IsOptional() @IsString() name?: string;

  @IsOptional() @IsArray() @Type(() => Number) @IsNumber({}, { each: true })
  priestIds?: number[];

  // ⬇️ NEW
  @IsOptional() @IsArray() @Type(() => Number) @IsNumber({}, { each: true })
  categoryIds?: number[];

  @IsOptional() @Type(() => Number) @IsNumber() amount?: number;
  @IsOptional() @Type(() => Number) @IsNumber() durationMin?: number;
  @IsOptional() @Type(() => Number) @IsNumber() prepTimeMin?: number;
  @IsOptional() @Type(() => Number) @IsNumber() bufferMin?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  outsideAmount?: number | null;

  @IsOptional() @Type(() => Boolean) @IsBoolean() isInVenue?: boolean;
  @IsOptional() @Type(() => Boolean) @IsBoolean() isOutsideVenue?: boolean;

  @IsOptional() @Type(() => Number) @IsNumber() venueId?: number;

  @IsOptional() @IsDateString() date?: string | null;
  @IsOptional() @IsDateString() time?: string | null;

  @IsOptional() @IsString() venueAddress?: string;
  @IsOptional() @IsString() mapLink?: string;

  @IsOptional() @IsArray() @IsString({ each: true }) allowedZones?: string[];

  @IsOptional() @Type(() => Boolean) @IsBoolean() includeFood?: boolean;
  @IsOptional() @Type(() => Boolean) @IsBoolean() includeHall?: boolean;

  @IsOptional() @IsString() materials?: string;
  @IsOptional() @IsString() notes?: string;
  @IsOptional() @IsString() description?: string;

  @IsOptional() @Type(() => Number) featuredMediaId?: number;
  @IsOptional() clearFeaturedMedia?: boolean;
}

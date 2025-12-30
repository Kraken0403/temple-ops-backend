import { IsString, IsNumber, IsBoolean, IsDateString, IsOptional, IsArray } from 'class-validator';
import { Type } from 'class-transformer';

export class CreatePoojaJsonDto {
  @IsString() name!: string;

  @IsArray() @Type(() => Number) @IsNumber({}, { each: true })
  priestIds!: number[];

  @IsOptional()
  @IsArray()
  @Type(() => Number)
  @IsNumber({}, { each: true })
  categoryIds?: number[];

  @Type(() => Number) @IsNumber() amount!: number;
  @Type(() => Number) @IsNumber() durationMin!: number;
  @Type(() => Number) @IsNumber() prepTimeMin!: number;
  @Type(() => Number) @IsNumber() bufferMin!: number;

  @Type(() => Boolean) @IsBoolean() isInVenue!: boolean;
  @Type(() => Boolean) @IsBoolean() isOutsideVenue!: boolean;

  
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  outsideAmount?: number | null;

  @IsOptional() @Type(() => Number) @IsNumber()
  venueId?: number;

  @IsOptional() @IsDateString() date?: string;
  @IsOptional() @IsDateString() time?: string;

  @IsOptional() @IsString() venueAddress?: string;
  @IsOptional() @IsString() mapLink?: string;

  @IsArray() @IsOptional() @IsString({ each: true })
  allowedZones?: string[];

  @IsOptional() @Type(() => Boolean) @IsBoolean() includeFood?: boolean;
  @IsOptional() @Type(() => Boolean) @IsBoolean() includeHall?: boolean;

  @IsOptional() @IsString() materials?: string;
  @IsOptional() @IsString() notes?: string;
  @IsOptional() @IsString() description?: string;

  @IsOptional() @Type(() => Number) featuredMediaId?: number;
  @IsOptional() clearFeaturedMedia?: boolean;
}

// src/pooja/dto/create-pooja-json.dto.ts
import {
    IsString, IsNumber, IsBoolean,
    IsDateString, IsOptional, IsArray, ValidateIf
  } from 'class-validator';
  import { Type } from 'class-transformer';
  
  export class CreatePoojaJsonDto {
    @IsString()         name!: string;
  
    @IsArray()
    @Type(() => Number)
    @IsNumber({}, { each: true })
                        priestIds!: number[];
  
    @Type(() => Number)  @IsNumber() amount!: number;

  
    @Type(() => Number)  @IsNumber() durationMin!: number;
    @Type(() => Number)  @IsNumber() prepTimeMin!: number;
    @Type(() => Number)  @IsNumber() bufferMin!: number;
  
    @Type(() => Boolean) @IsBoolean()    isInVenue!: boolean;
    @Type(() => Boolean) @IsBoolean()    isOutsideVenue!: boolean;
  
    @ValidateIf(o => o.isInVenue)
    @IsDateString()       date?: string;
  
    @ValidateIf(o => o.isInVenue)
    @IsDateString()       time?: string;
  
    @ValidateIf(o => o.isInVenue)
    @IsOptional() @IsString() venueAddress?: string;
  
    @ValidateIf(o => o.isInVenue)
    @IsOptional() @IsString() mapLink?: string;
  
    @ValidateIf(o => o.isOutsideVenue)
    @IsArray() @IsString({ each: true })
                          allowedZones?: string[];
  
    @IsOptional() @Type(() => Boolean) @IsBoolean()
                          includeFood?: boolean;
  
    @IsOptional() @Type(() => Boolean) @IsBoolean()
                          includeHall?: boolean;
  
    @IsOptional() @IsString() materials?: string;
    @IsOptional() @IsString() notes?: string;
    @IsOptional()
    @IsString()
    description?: string;
  
    @IsOptional() @IsString() photoUrl?: string;
  }
  
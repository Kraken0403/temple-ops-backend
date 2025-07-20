import {
    IsString,
    IsOptional,
    IsDateString,
    IsBoolean,
    IsInt,
    IsNumber,
    IsArray,
  } from 'class-validator';
  
  export class CreateEventDto {
    @IsString()
    name!: string;
  
    @IsString()
    @IsOptional()
    description?: string;
  
    @IsString()
    @IsOptional()
    imageUrl?: string;
  
    @IsString()
    venue!: string;
  
    @IsString()
    @IsOptional()
    mapLink?: string;
  
    @IsDateString()
    date!: string;
  
    @IsDateString()
    @IsOptional()
    endDate?: string;
  
    @IsDateString()
    @IsOptional()
    startTime?: string;
  
    @IsDateString()
    @IsOptional()
    endTime?: string;
  
    @IsArray()
    @IsOptional()
    tags?: string[];
  
    @IsInt()
    @IsOptional()
    capacity?: number;
  
    @IsNumber()
    @IsOptional()
    price?: number;
  
    @IsString()
    @IsOptional()
    organizer?: string;
  
    @IsString()
    @IsOptional()
    contactInfo?: string;
  
    @IsBoolean()
    @IsOptional()
    isPublic?: boolean;
  }
  
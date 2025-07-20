// src/events/dto/book-event.dto.ts

import { IsInt, Min, IsOptional, IsString } from 'class-validator';

export class BookEventDto {
  @IsInt()
  @Min(1)
  pax!: number;

  @IsString()
  @IsOptional()
  userName?: string;

  @IsString()
  @IsOptional()
  userEmail?: string;

  @IsString()
  @IsOptional()
  userPhone?: string;
}

import {
  IsInt,
  IsDateString,
  IsBoolean,
  IsEnum,
  IsOptional,
  IsArray,
  ArrayNotEmpty,
  IsString
} from 'class-validator';
import { SlotType } from '@prisma/client';

export class CreateSlotDto {
  @IsInt()
  priestId!: number;

  @IsDateString()
  start!: string;

  @IsDateString()
  end!: string;

  /** ← NEW: date for one-off slots */
  @IsOptional()
  @IsDateString()
  date?: string;

  @IsBoolean()
  disabled!: boolean;

  @IsEnum(SlotType)
  type!: SlotType;

  /** Optional: list of weekdays for a recurring slot */
  @IsOptional()
  @IsArray()
  @ArrayNotEmpty()
  @IsString({ each: true })
  daysOfWeek?: string[];
}

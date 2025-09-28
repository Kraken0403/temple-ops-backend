import {
  IsInt,
  IsDateString,
  IsBoolean,
  IsEnum,
  IsOptional,
  IsArray,
  ArrayNotEmpty,
  IsString,
} from 'class-validator'
import { SlotType } from '@prisma/client'

export class CreateSlotDto {
  @IsInt()
  priestId!: number

  /** Local start time (ISO string in configured timezone) */
  @IsDateString()
  start!: string

  /** Local end time (ISO string in configured timezone) */
  @IsDateString()
  end!: string

  /** One-off slot date (optional, ISO string in configured timezone) */
  @IsOptional()
  @IsDateString()
  date?: string

  @IsBoolean()
  disabled!: boolean

  @IsEnum(SlotType)
  type!: SlotType

  /** Optional: list of weekdays for recurring slot */
  @IsOptional()
  @IsArray()
  @ArrayNotEmpty()
  @IsString({ each: true })
  daysOfWeek?: string[]
}

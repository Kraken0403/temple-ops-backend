import { IsString, IsNumber, Min, IsOptional, IsBoolean, IsInt } from 'class-validator'

export class CreateSponsorshipTypeDto {
  @IsString()
  name!: string

  @IsString()
  description!: string

  @IsNumber()
  @Min(0)
  price!: number

  // NEW
  @IsOptional()
  startsAt?: string // ISO string

  @IsOptional()
  endsAt?: string // ISO string

  @IsOptional()
  @IsBoolean()
  isActive?: boolean

  @IsOptional()
  @IsInt()
  @Min(0)
  defaultMaxSlots?: number
}

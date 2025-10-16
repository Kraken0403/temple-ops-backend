import { PartialType } from '@nestjs/mapped-types'
import { CreateSponsorshipTypeDto } from './create-sponsorship-type.dto'
import { IsOptional, IsString, IsNumber, Min, IsBoolean, IsInt } from 'class-validator'

export class UpdateSponsorshipTypeDto extends PartialType(CreateSponsorshipTypeDto) {
  @IsOptional()
  @IsString()
  name?: string

  @IsOptional()
  @IsString()
  description?: string

  @IsOptional()
  @IsNumber()
  @Min(0)
  price?: number

  // keep these optional as well
  @IsOptional()
  startsAt?: string

  @IsOptional()
  endsAt?: string

  @IsOptional()
  @IsBoolean()
  isActive?: boolean

  @IsOptional()
  @IsInt()
  @Min(0)
  defaultMaxSlots?: number
}

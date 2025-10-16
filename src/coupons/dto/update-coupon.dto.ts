import { PartialType } from '@nestjs/mapped-types'
import { CreateCouponDto } from './create-coupon.dto'
import { IsArray, IsISO8601, IsOptional } from 'class-validator'
import { Type } from 'class-transformer'

export class UpdateCouponDto extends PartialType(CreateCouponDto) {
  // Override date fields to allow explicit null (clear schedule)
  @IsOptional()
  @IsISO8601()
  startsAt?: string | null

  @IsOptional()
  @IsISO8601()
  endsAt?: string | null

  /** When arrays are present (even empty), service does a full “set” for scope */
  @IsOptional()
  @IsArray()
  @Type(() => Number)
  eventIds?: number[]

  @IsOptional()
  @IsArray()
  @Type(() => Number)
  poojaIds?: number[]

  @IsOptional()
  @IsArray()
  @Type(() => Number)
  poojaCategoryIds?: number[]
}

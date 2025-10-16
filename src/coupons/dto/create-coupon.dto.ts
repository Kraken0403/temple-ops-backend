import { IsBoolean, IsEnum, IsInt, IsISO8601, IsNumber, IsOptional, IsPositive, IsString, Min, MinLength, IsArray } from 'class-validator'
import { Type } from 'class-transformer'

export enum CouponTypeDto {
  PERCENT = 'PERCENT',
  FLAT = 'FLAT',
}

export class CreateCouponDto {
  @IsString()
  @MinLength(2)
  code!: string

  @IsOptional()
  @IsString()
  description?: string

  @IsEnum(CouponTypeDto)
  type!: CouponTypeDto

  /** If PERCENT → 0–100, If FLAT → amount in currency units */
  @IsNumber()
  @Type(() => Number)
  @Min(0)
  value!: number

  /** Max discount cap (used only for PERCENT) */
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  @Min(0)
  maxDiscount?: number | null

  /** Minimum order/subtotal to allow coupon */
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  @Min(0)
  minOrderAmount?: number | null

  /** Start datetime (inclusive) */
  @IsOptional()
  @IsISO8601()
  startsAt?: string | null

  /** End datetime (inclusive) */
  @IsOptional()
  @IsISO8601()
  endsAt?: string | null

  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  isActive?: boolean

  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  stackable?: boolean

  /** Global usage limit (across all users) */
  @IsOptional()
  @IsInt()
  @Type(() => Number)
  @Min(1)
  usageLimit?: number | null

  /** Per-user usage limit */
  @IsOptional()
  @IsInt()
  @Type(() => Number)
  @Min(1)
  usageLimitPerUser?: number | null

  /** Scope: allowed events (empty or omitted → global) */
  @IsOptional()
  @IsArray()
  @Type(() => Number)
  eventIds?: number[]

  /** Scope: allowed poojas (empty or omitted → global) */
  @IsOptional()
  @IsArray()
  @Type(() => Number)
  poojaIds?: number[]

  /** Scope: allowed pooja categories (empty or omitted → global) */
  @IsOptional()
  @IsArray()
  @Type(() => Number)
  poojaCategoryIds?: number[]
}

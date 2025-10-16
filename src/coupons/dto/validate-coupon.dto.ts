import { IsEnum, IsInt, IsOptional, Min } from 'class-validator'
import { Type } from 'class-transformer'

export enum ValidateKind {
  EVENT = 'event',
  POOJA = 'pooja',
}

/**
 * Query DTO for GET /coupons/validate/:code
 * - For EVENT: provide eventId (required) and pax (optional, default 1)
 * - For POOJA: provide poojaId (required)
 * - userId is optional (enables per-user usage check)
 */
export class ValidateCouponQueryDto {
  @IsEnum(ValidateKind)
  kind!: ValidateKind

  // EVENT fields
  @IsOptional()
  @IsInt()
  @Type(() => Number)
  eventId?: number

  @IsOptional()
  @IsInt()
  @Min(1)
  @Type(() => Number)
  pax?: number

  // POOJA fields
  @IsOptional()
  @IsInt()
  @Type(() => Number)
  poojaId?: number

  // Optional user id (to enforce per-user usage)
  @IsOptional()
  @IsInt()
  @Type(() => Number)
  userId?: number
}

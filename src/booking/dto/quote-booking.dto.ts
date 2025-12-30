import { IsInt, IsOptional, IsString, IsNumber } from 'class-validator'

export class QuoteBookingDto {
  @IsInt()
  poojaId!: number

  @IsOptional()
  @IsInt()
  userId?: number

  // Only required for outside venue
  @IsOptional()
  @IsNumber()
  venueLat?: number

  @IsOptional()
  @IsNumber()
  venueLng?: number

  @IsOptional()
  @IsString()
  couponCode?: string
}

// src/booking/dto/update-booking.dto.ts
import {
  IsInt,
  IsOptional,
  IsDateString,
  IsString,
  IsIn,
  IsEmail,
  IsNumber, Min, Max
} from 'class-validator'

export class UpdateBookingDto {
  @IsOptional() @IsInt()
  userId?: number

  @IsOptional() @IsInt()
  poojaId?: number

  @IsOptional() @IsInt()
  priestId?: number

  /** The date the user selected for the booking (YYYY-MM-DD or full ISO) */
  @IsOptional() @IsDateString()
  bookingDate?: string

  @IsOptional()
  @IsIn(['TEMPLE', 'CUSTOM'])
  venueType?: 'TEMPLE' | 'CUSTOM'


  /** Full ISO timestamp for slot start (including time) */
  @IsOptional() @IsDateString()
  start?: string

  /** Full ISO timestamp for slot end (including time) */
  @IsOptional() @IsDateString()
  end?: string

  @IsOptional() @IsString()
  userName?: string

  @IsOptional() @IsEmail()
  userEmail?: string

  @IsOptional() @IsString()
  userPhone?: string

  @IsOptional() @IsString()
  venueAddress?: string

  @IsOptional() @IsString()
  venueState?: string

  @IsOptional() @IsString()
  venueZip?: string

  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 8 })
  @Min(-90)
  @Max(90)
  venueLat?: number

  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 8 })
  @Min(-180)
  @Max(180)
  venueLng?: number

  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  travelDistanceKm?: number


  /** Optional status update */
  @IsOptional() @IsIn(['pending','confirmed','canceled','completed'])
  status?: string

  /** 🎟️ Optional coupon code to (re)apply; send empty/omit to keep current */
  @IsOptional() @IsString()
  couponCode?: string
}

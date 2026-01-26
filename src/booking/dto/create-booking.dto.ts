import { 
  IsInt, 
  IsDateString, 
  IsOptional, 
  IsString,
  IsNumber, Min, Max, IsIn
} from 'class-validator'

export class CreateBookingDto {
  @IsOptional() 
  @IsInt()
  userId?: number

  @IsInt()
  poojaId!: number

  @IsInt()
  priestId!: number

  /** The date the user selected for the booking (YYYY-MM-DD or full ISO) */
  @IsDateString()
  bookingDate!: string

  /** Full ISO timestamp for slot start (including time) */
  @IsDateString()
  start!: string

  /** Full ISO timestamp for slot end (including time) */
  @IsDateString()
  end!: string

  @IsOptional()
  @IsIn(['TEMPLE', 'CUSTOM'])
  venueType?: 'TEMPLE' | 'CUSTOM'


  @IsOptional() @IsString()
  userName?: string

  @IsOptional() @IsString()
  userEmail?: string

  @IsOptional() @IsString()
  userPhone?: string

  @IsOptional() @IsString()
  venueAddress?: string

  @IsOptional() @IsString()
  venueState?: string

  @IsOptional() @IsString()
  venueZip?: string

    // 🆕 Map pin (Outside venue)
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

  // 🆕 Optional UI preview (backend will re-calc)
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  travelDistanceKm?: number

  @IsOptional() @IsString()
  couponCode?: string

  
}

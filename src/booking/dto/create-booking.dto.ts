import { 
  IsInt, 
  IsDateString, 
  IsOptional, 
  IsString 
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

  @IsOptional() @IsString()
  couponCode?: string
}

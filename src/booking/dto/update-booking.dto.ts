import {
    IsInt,
    IsOptional,
    IsDateString,
    IsString,
    IsIn,
    IsEmail,
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
  
    /** Optional status update */
    @IsOptional() @IsIn(['pending','confirmed','canceled','completed'])
    status?: string
  }
  
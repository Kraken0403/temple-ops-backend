import {
  IsBoolean,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  IsNumber,
} from 'class-validator'

export class CreateVenueDto {
  @IsString()
  @IsNotEmpty()
  title!: string

  @IsString()
  @IsNotEmpty()
  @MaxLength(1000)
  address!: string

  @IsString()
  @IsNotEmpty()
  @MaxLength(20)
  zipcode!: string

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  mapLink?: string

  @IsOptional()
  @IsBoolean()
  isActive?: boolean

  // ✅ ADD THESE TWO LINES ONLY
  @IsOptional()
  @IsNumber()
  latitude?: number

  @IsOptional()
  @IsNumber()
  longitude?: number
}

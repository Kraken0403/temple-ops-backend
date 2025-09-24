import { IsOptional, IsString, IsArray, IsEmail, IsNumber, IsBoolean } from 'class-validator'
import { Type } from 'class-transformer'

export class UpdatePriestDto {
  @IsOptional() @IsString()
  name?: string

  @IsOptional() @IsString()
  specialty?: string

  @IsOptional() @IsString()
  contactNo?: string

  @IsOptional() @IsEmail()
  email?: string

  @IsOptional() @IsArray() @IsString({ each: true })
  languages?: string[]

  @IsOptional() @IsString()
  address?: string

  @IsOptional() @IsArray() @IsString({ each: true })
  qualifications?: string[]

  // set/replace image
  @IsOptional() @Type(() => Number) @IsNumber()
  featuredMediaId?: number

  // explicitly clear image
  @IsOptional() @IsBoolean()
  clearFeaturedMedia?: boolean
}

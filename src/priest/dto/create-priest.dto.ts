import { IsOptional, IsString, IsArray, IsEmail, IsNumber, IsBoolean } from 'class-validator'
import { Type } from 'class-transformer'

export class CreatePriestDto {
  @IsString()
  name!: string

  @IsOptional() @IsString()
  specialty?: string

  @IsOptional() @IsEmail()
  email?: string

  @IsOptional() @IsString()
  contactNo?: string

  @IsOptional() @IsString()
  address?: string

  @IsOptional() @IsArray() @IsString({ each: true })
  languages?: string[]

  @IsOptional() @IsArray() @IsString({ each: true })
  qualifications?: string[]

  // unified featured image
  @IsOptional() @Type(() => Number) @IsNumber()
  featuredMediaId?: number

  // rarely useful on create; allowed for parity with update
  @IsOptional() @IsBoolean()
  clearFeaturedMedia?: boolean
}

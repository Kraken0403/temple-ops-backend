import { IsOptional, IsString, IsArray, IsEmail } from 'class-validator'

export class UpdatePriestDto {
  @IsOptional()
  @IsString()
  name?: string

  @IsOptional()
  @IsString()
  specialty?: string

  @IsOptional()
  @IsString()
  photo?: string

  @IsOptional()
  @IsString()
  contactNo?: string

  @IsOptional()
  @IsEmail()
  email?: string

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  languages?: string[]

  @IsOptional()
  @IsString()
  address?: string

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  qualifications?: string[]
}

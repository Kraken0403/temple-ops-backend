import { IsString, IsOptional } from 'class-validator'

export class UpdatePoojaCategoryDto {
  @IsOptional()
  @IsString()
  name?: string

  @IsOptional()
  @IsString()
  description?: string

  @IsOptional()
  @IsString()
  slug?: string
}

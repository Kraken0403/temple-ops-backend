import { IsString, IsOptional } from 'class-validator'

export class CreatePoojaCategoryDto {
  @IsString()
  name!: string

  @IsOptional()
  @IsString()
  description?: string

  @IsOptional()
  @IsString()
  slug?: string
}

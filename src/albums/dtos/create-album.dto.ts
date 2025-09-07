import { IsBoolean, IsInt, IsOptional, IsString, MaxLength } from 'class-validator'

export class CreateAlbumDto {
  @IsString() title!: string
  @IsOptional() @IsString() slug?: string
  @IsOptional() @IsString() @MaxLength(1000) description?: string
  @IsOptional() @IsBoolean() isPublic?: boolean
  @IsOptional() @IsInt() coverId?: number
}

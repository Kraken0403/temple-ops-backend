import { IsBoolean, IsInt, IsOptional, IsString, MaxLength } from 'class-validator'

export class UpdateAlbumDto {
  @IsOptional() @IsString() title?: string
  @IsOptional() @IsString() slug?: string
  @IsOptional() @IsString() @MaxLength(1000) description?: string
  @IsOptional() @IsBoolean() isPublic?: boolean
  @IsOptional() @IsInt() coverId?: number // send null from controller if you want to unset
}

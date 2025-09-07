import { ArrayNotEmpty, IsArray, IsInt } from 'class-validator'
import { Type } from 'class-transformer'

export class AddItemsDto {
  @IsArray() @ArrayNotEmpty() @Type(() => Number) @IsInt({ each: true })
  mediaIds!: number[]
}

import { IsArray, ValidateNested, IsInt } from 'class-validator'
import { Type } from 'class-transformer'

class ReorderItem {
  @Type(() => Number) @IsInt() itemId!: number
  @Type(() => Number) @IsInt() sortOrder!: number
}

export class ReorderItemsDto {
  @IsArray() @ValidateNested({ each: true }) @Type(() => ReorderItem)
  order!: ReorderItem[]
}

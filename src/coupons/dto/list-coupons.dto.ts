import { IsBooleanString, IsInt, IsOptional, IsString, Min } from 'class-validator'
import { Type } from 'class-transformer'

export class ListCouponsQueryDto {
  @IsOptional()
  @IsInt()
  @Type(() => Number)
  @Min(1)
  page?: number

  @IsOptional()
  @IsInt()
  @Type(() => Number)
  @Min(1)
  pageSize?: number

  @IsOptional()
  @IsString()
  search?: string

  /** 'true' | 'false' for querystring friendliness */
  @IsOptional()
  @IsBooleanString()
  active?: string
}

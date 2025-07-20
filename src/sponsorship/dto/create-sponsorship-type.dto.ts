import { IsString, IsNumber, Min } from 'class-validator'

export class CreateSponsorshipTypeDto {
  @IsString()
  name!: string

  @IsString()
  description!: string

  @IsNumber()
  @Min(0)
  price!: number
}

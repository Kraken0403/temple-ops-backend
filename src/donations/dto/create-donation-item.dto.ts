// src/donations/dto/create-donation-item.dto.ts
import { IsString, IsNumber } from 'class-validator'

export class CreateDonationItemDto {
  @IsString()
  name!: string

  @IsNumber()
  amount!: number

  @IsString()
  currency!: string
}

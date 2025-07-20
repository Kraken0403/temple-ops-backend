// src/donations/dto/create-donation-record.dto.ts
import { IsNumber, IsString, IsEmail } from 'class-validator'

export class CreateDonationRecordDto {
  @IsNumber()
  donationItemId!: number

  @IsString()
  donorName!: string

  @IsEmail()
  donorEmail!: string

  @IsString()
  donorPhone!: string
}

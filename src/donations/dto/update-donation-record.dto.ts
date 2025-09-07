// src/donations/dto/update-donation-record.dto.ts
import { IsInt, IsOptional, IsString, IsEmail } from 'class-validator'

export class UpdateDonationRecordDto {
  @IsOptional() @IsInt()
  donationItemId?: number

  @IsOptional() @IsString()
  donorName?: string

  @IsOptional() @IsEmail()
  donorEmail?: string

  @IsOptional() @IsString()
  donorPhone?: string
}

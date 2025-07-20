import { IsInt, IsString, IsEmail } from 'class-validator'

export class CreateSponsorshipBookingDto {
  @IsInt()
  eventSponsorshipId!: number

  @IsString()
  sponsorName!: string

  @IsEmail()
  sponsorEmail!: string

  @IsString()
  sponsorPhone!: string
}

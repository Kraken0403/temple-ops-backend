// src/donations/dto/update-donation-item.dto.ts
import { PartialType } from '@nestjs/mapped-types'
import { CreateDonationItemDto } from './create-donation-item.dto'

export class UpdateDonationItemDto extends PartialType(CreateDonationItemDto) {}

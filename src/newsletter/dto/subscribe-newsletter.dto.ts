import { IsEmail, IsEnum } from 'class-validator'
import { NewsletterSource } from '@prisma/client'

export class SubscribeNewsletterDto {
  @IsEmail()
  email: string

  @IsEnum(NewsletterSource)
  source: NewsletterSource

  constructor(email: string, source: NewsletterSource) {
    this.email = email
    this.source = source
  }
}

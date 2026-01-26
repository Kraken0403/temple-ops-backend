import {
  Body,
  Controller,
  Get,
  Patch,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common'
import { NewsletterService } from './newsletter.service'
import { SubscribeNewsletterDto } from './dto/subscribe-newsletter.dto'
import { JwtAuthGuard } from '../auth/jwt-auth.guard'

@Controller('newsletter')
export class NewsletterController {
  constructor(private readonly service: NewsletterService) {}

  /* =========================
     PUBLIC SUBSCRIBE
     (no auth, like booking/search APIs)
  ========================= */
  @Post('subscribe')
  subscribe(@Body() dto: SubscribeNewsletterDto) {
    return this.service.subscribe(dto)
  }

  /* =========================
     ADMIN LIST
  ========================= */
  @UseGuards(JwtAuthGuard)
  @Get('subscribers')
  list() {
    return this.service.listSubscribers()
  }

  /* =========================
     ADMIN UNSUBSCRIBE
  ========================= */
  @UseGuards(JwtAuthGuard)
  @Patch('subscribers/:id/unsubscribe')
  unsubscribe(@Param('id') id: string) {
    return this.service.unsubscribe(+id)
  }
}

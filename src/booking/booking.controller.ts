import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  ParseIntPipe,
  NotFoundException
} from '@nestjs/common'
import { BookingService } from './booking.service'
import { CreateBookingDto } from './dto/create-booking.dto'

@Controller('booking')
export class BookingController {
  constructor(private svc: BookingService) {}

  @Post()
  create(@Body() dto: CreateBookingDto) {
    return this.svc.create(dto)
  }

  @Get()
  findAll() {
    return this.svc.findAll()
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    const booking = await this.svc.findOne(id)
    if (!booking) throw new NotFoundException('Booking not found')
    return booking
  }
}

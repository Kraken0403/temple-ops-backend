import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  ParseIntPipe,
  NotFoundException,
  Patch,
  Delete,
} from '@nestjs/common'
import { BookingService } from './booking.service'
import { CreateBookingDto } from './dto/create-booking.dto'
import { UpdateBookingDto } from './dto/update-booking.dto'

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

  // ✅ Partial update (admin/staff; or user if you gate it with guards)
  @Patch(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateBookingDto
  ) {
    const updated = await this.svc.update(id, dto)
    if (!updated) throw new NotFoundException('Booking not found')
    return updated
  }

  // ✅ Optional: status-only endpoint (handy for quick actions)
  @Patch(':id/status/:status')
  async updateStatus(
    @Param('id', ParseIntPipe) id: number,
    @Param('status') status: string
  ) {
    return this.svc.update(id, { status } as UpdateBookingDto)
  }

  // ✅ Delete booking
  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number) {
    await this.svc.remove(id)
    return { ok: true }
  }
}

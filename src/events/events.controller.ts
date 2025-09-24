import { Controller, Get, Post, Patch, Delete, Param, ParseIntPipe, Body, BadRequestException } from '@nestjs/common';
import { EventsService } from './events.service';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { BookEventDto } from './dto/book-event.dto';

@Controller('events')
export class EventsController {
  constructor(private readonly svc: EventsService) {}

  @Post()
  create(@Body() dto: CreateEventDto) { return this.svc.create(dto) }

  @Get()
  findAll() { return this.svc.findAll() }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) { return this.svc.findOne(id) }

  @Patch(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateEventDto) {
    return this.svc.update(id, dto)
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) { return this.svc.remove(id) }

  // Bookings
  @Post(':id/book')
  bookGuest(@Param('id', ParseIntPipe) id: number, @Body() dto: BookEventDto) {
    return this.svc.bookEventAsGuest(id, dto)
  }

  @Get(':id/bookings')
  bookings(@Param('id', ParseIntPipe) id: number) {
    return this.svc.findBookings(id)
  }

  // Media helpers
  @Patch(':id/featured-media')
  setFeatured(@Param('id', ParseIntPipe) id: number, @Body('mediaId') mediaId?: number | null) {
    if (mediaId !== null && mediaId !== undefined && Number.isNaN(Number(mediaId))) {
      throw new BadRequestException('mediaId must be a number or null')
    }
    return this.svc.setFeaturedMedia(id, mediaId ?? null)
  }

  @Post(':id/gallery')
  addGallery(@Param('id', ParseIntPipe) id: number, @Body('mediaIds') mediaIds: number[]) {
    return this.svc.addToGallery(id, mediaIds ?? [])
  }

  @Patch(':id/gallery')
  reorderGallery(@Param('id', ParseIntPipe) id: number, @Body() orders: { mediaId: number; sortOrder: number }[]) {
    return this.svc.reorderGallery(id, orders ?? [])
  }

  @Delete(':id/gallery/:mediaId')
  removeGallery(@Param('id', ParseIntPipe) id: number, @Param('mediaId', ParseIntPipe) mediaId: number) {
    return this.svc.removeFromGallery(id, mediaId)
  }
}

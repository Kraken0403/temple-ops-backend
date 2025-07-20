// src/events/events.controller.ts

import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  ParseIntPipe,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { EventsService } from './events.service';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { BookEventDto } from './dto/book-event.dto';

@Controller('events')
export class EventsController {
  constructor(private readonly eventsService: EventsService) {}

  // ——— Photo upload
  @Post('upload-photo')
  @UseInterceptors(FileInterceptor('file'))
  async uploadPhoto(@UploadedFile() file: Express.Multer.File) {
    const url = await this.eventsService.savePhotoAndGetUrl(file);
    return { url };
  }

  // ——— CRUD
  @Post()
  create(@Body() dto: CreateEventDto) {
    return this.eventsService.create(dto);
  }

  @Get()
  findAll() {
    return this.eventsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.eventsService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateEventDto,
  ) {
    return this.eventsService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.eventsService.remove(id);
  }

  @Get(':id/bookings')
  findBookings(@Param('id', ParseIntPipe) id: number) {
    return this.eventsService.findBookings(id);
  }

  // ——— Guest booking (no AuthGuard)
  @Post(':id/book')
  book(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: BookEventDto,
  ) {
    return this.eventsService.bookEventAsGuest(id, dto);
  }
}

// src/priest/priest.controller.ts
import {
    Controller, Get, Post, Patch, Delete,
    Body, Param, ParseIntPipe, UploadedFile,
    UseInterceptors,
    Query, BadRequestException
  } from '@nestjs/common';
  import { PriestService }      from './priest.service';
  import { CreatePriestDto }    from './dto/create-priest.dto';
  import { UpdatePriestDto }    from './dto/update-priest.dto';
  import { CreateSlotDto }      from './dto/create-slot.dto';
  import { UpdateSlotDto }      from './dto/update-slot.dto';

  import { FileInterceptor } from '@nestjs/platform-express';
  import { diskStorage } from 'multer';
  import { extname } from 'path';
  
  @Controller('priest')
  export class PriestController {
    constructor(private readonly svc: PriestService) {}
  
    // Priest endpoints
    
    @Post()
    async createPriest(@Body() dto: CreatePriestDto) {
      return this.svc.createPriest(dto);
    }

    @Post('upload-photo')
    @UseInterceptors(FileInterceptor('file'))
    async uploadPhoto(@UploadedFile() file: Express.Multer.File) {
      const url = await this.svc.savePhotoAndGetUrl(file);
      return { url };
    }

  
    @Get()
    async getAll() {
      return this.svc.getAllPriests();
    }
  
    @Get(':id')
    async getOne(@Param('id', ParseIntPipe) id: number) {
      return this.svc.getPriest(id);
    }
  
    @Patch(':id')
    async updatePriest(
      @Param('id', ParseIntPipe) id: number,
      @Body() dto: UpdatePriestDto
    ) {
      return this.svc.updatePriest(id, dto);
    }
  
    @Delete(':id')
    async deletePriest(@Param('id', ParseIntPipe) id: number) {
      return this.svc.deletePriest(id);
    }
  
    // AvailabilitySlot endpoints
    @Post('slot')
    async createSlot(@Body() dto: CreateSlotDto) {
      return this.svc.createSlot(dto);
    }
  
    @Get(':priestId/slots')
    async getSlots(@Param('priestId', ParseIntPipe) priestId: number) {
      return this.svc.getSlotsForPriest(priestId);
    }
  
    @Patch('slot/:id')
    async updateSlot(
      @Param('id', ParseIntPipe) id: number,
      @Body() dto: UpdateSlotDto
    ) {
      return this.svc.updateSlot(id, dto);
    }
  
    @Delete('slot/:id')
    async deleteSlot(@Param('id', ParseIntPipe) id: number) {
      return this.svc.deleteSlot(id);
    }

    @Get(':priestId/slots-range')
    async getSlotsInRange(
      @Param('priestId', ParseIntPipe) priestId: number,
      @Query('from') from: string,
      @Query('to') to: string
    ) {
      return this.svc.getSlotsForPriestInRange(priestId, new Date(from), new Date(to));
    }

    // src/priest/priest.controller.ts
    @Get(':priestId/available-chunks')
    async getAvailableChunks(
      @Param('priestId', ParseIntPipe) priestId: number,
      @Query('duration') duration: string,
      @Query('date') date: string,
      @Query('totalMinutes') totalMinutes?: string,   // allow new names too
      @Query('bookingDate') bookingDate?: string,
    ) {
      const finalDate = date ?? bookingDate;
      const minutesStr = duration ?? totalMinutes;
      const minutes = Number(minutesStr);

      if (!finalDate) throw new BadRequestException('Date/bookingDate is required');
      if (!minutes || Number.isNaN(minutes)) throw new BadRequestException('duration/totalMinutes must be a positive number');

      // Helpful server log so you can see hits in prod
      console.log('[API] available-chunks', { priestId, finalDate, minutes });

      return this.svc.getAvailableChunks(priestId, finalDate, minutes);
    }


  }
  
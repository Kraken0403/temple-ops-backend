// src/donations/donation-record.controller.ts
import {
  Controller, Post, Body, Get, Param, ParseIntPipe, Patch, Delete
} from '@nestjs/common'
import { DonationRecordService } from './donation-record.service'
import { CreateDonationRecordDto } from './dto/create-donation-record.dto'
import { UpdateDonationRecordDto } from './dto/update-donation-record.dto'

@Controller('donations')
export class DonationRecordController {
  constructor(private readonly svc: DonationRecordService) {}

  @Post()
  create(@Body() dto: CreateDonationRecordDto) {
    return this.svc.create(dto)
  }

  @Get()
  findAll() {
    return this.svc.findAll()
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.svc.findOne(id)
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateDonationRecordDto
  ) {
    return this.svc.update(id, dto)
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.svc.remove(id)
  }
}

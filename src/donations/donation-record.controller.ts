// src/donations/donation-record.controller.ts
import {
    Controller, Post, Body,
    Get, Param, ParseIntPipe
  } from '@nestjs/common'
  import { DonationRecordService } from './donation-record.service'
  import { CreateDonationRecordDto } from './dto/create-donation-record.dto'
  
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
  }
  
// src/donations/donation-item.controller.ts
import {
    Controller, Get, Post, Body,
    Patch, Param, Delete, ParseIntPipe
  } from '@nestjs/common'
  import { DonationItemService } from './donation-item.service'
  import { CreateDonationItemDto } from './dto/create-donation-item.dto'
  import { UpdateDonationItemDto } from './dto/update-donation-item.dto'
  
  @Controller('donation-items')
  export class DonationItemController {
    constructor(private readonly svc: DonationItemService) {}
  
    @Post()
    create(@Body() dto: CreateDonationItemDto) {
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
      @Body() dto: UpdateDonationItemDto
    ) {
      return this.svc.update(id, dto)
    }
  
    @Delete(':id')
    remove(@Param('id', ParseIntPipe) id: number) {
      return this.svc.remove(id)
    }
  }
  
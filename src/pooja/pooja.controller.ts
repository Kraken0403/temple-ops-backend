// src/pooja/pooja.controller.ts
import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  UseInterceptors,
  UploadedFile,
  ParseIntPipe,
} from '@nestjs/common';
import { FileInterceptor }   from '@nestjs/platform-express';
import { PoojaService }      from './pooja.service';
import { CreatePoojaJsonDto } from './dto/create-pooja-json.dto';
import { UpdatePoojaDto }     from './dto/update-pooja.dto';

@Controller('pooja')
export class PoojaController {
  constructor(private readonly svc: PoojaService) {}

  @Get()
  findAll() {
    return this.svc.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.svc.findOne(id);
  }

  /** STEP 1: upload a file, return a URL */
  @Post('upload-photo')
  @UseInterceptors(FileInterceptor('file'))
  async uploadPhoto(@UploadedFile() file: Express.Multer.File) {
    const url = await this.svc.savePhotoAndGetUrl(file);
    return { url };
  }

  /** STEP 2: create via JSON (including the photoUrl you just got) */
  @Post()
  create(@Body() dto: CreatePoojaJsonDto) {
    return this.svc.createFromJson(dto);
  }

  /** Update via JSON */
  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdatePoojaDto
  ) {
    return this.svc.updateFromJson(id, dto);
  }
}

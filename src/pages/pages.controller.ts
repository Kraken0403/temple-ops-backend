import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { PagesService } from './pages.service';
import { CreatePageDto } from './dto/create-page.dto';
import { UpdatePageDto } from './dto/update-page.dto';

@Controller('pages')
export class PagesController {
  constructor(private readonly pages: PagesService) {}

  @Get()
  list() {
    return this.pages.findAll();
  }

  @Get(':id')
  one(@Param('id') id: string) {
    return this.pages.findOne(id);
  }

  // optionally, if you want lookup by slug:
  @Get('by-slug/:slug')
  bySlug(@Param('slug') slug: string) {
    return this.pages.findBySlug(slug);
  }

  @Post()
  create(@Body() dto: CreatePageDto) {
    return this.pages.create(dto);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() dto: UpdatePageDto,
  ) {
    return this.pages.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.pages.remove(id);
  }
}

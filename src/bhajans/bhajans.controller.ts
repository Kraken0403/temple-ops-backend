// bhajans.controller.ts
import { Controller, Get, Post, Body, Param, Query, Put, Delete } from '@nestjs/common';
import { BhajansService } from './bhajans.service';
import { CreateBhajanDto } from './dto/create-bhajan.dto';
import { UpdateBhajanDto } from './dto/update-bhajan.dto';

@Controller('bhajans')
export class BhajansController {
  constructor(private readonly service: BhajansService) {}

  @Get()
  findAll(
    @Query('search') search?: string,
    @Query('language') language?: string,
    @Query('tag') tag?: string,
    @Query('categoryId') categoryId?: string, // string in query
    @Query('page') page?: string,             // string in query
    @Query('limit') limit?: string,           // string in query
  ) {
    const toInt = (v?: string) => {
      const n = v == null ? NaN : Number(v);
      return Number.isFinite(n) ? Math.trunc(n) : undefined;
    };
    return this.service.findAll({
      search,
      language,
      tag,
      categoryId: toInt(categoryId),
      page: toInt(page),
      limit: toInt(limit),
      publishedOnly: true,
    });
  }

  @Get(':slug')
  findOne(@Param('slug') slug: string) {
    return this.service.findBySlug(slug);
  }

  @Post()
  create(@Body() dto: CreateBhajanDto) {
    return this.service.create(dto);
  }
  @Put(':id')
  update(@Param('id') id: string, @Body() dto: UpdateBhajanDto) {
    return this.service.update(Number(id), dto);
  }
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.service.remove(Number(id));
  }
}

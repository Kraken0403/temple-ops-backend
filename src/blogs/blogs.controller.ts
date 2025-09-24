import { Controller, Get, Post, Body, Param, Query, Put, Delete } from '@nestjs/common';
import { BlogsService } from './blogs.service';
import { CreateBlogDto } from './dto/create-blog.dto';
import { UpdateBlogDto } from './dto/update-blog.dto';

@Controller('blogs')
export class BlogsController {
  constructor(private readonly service: BlogsService) {}

  @Get()
  findAll(
    @Query('search') search?: string,
    @Query('tag') tag?: string,
    @Query('categoryId') categoryId?: number,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.service.findAll({ search, tag, categoryId, page: Number(page), limit: Number(limit), publishedOnly: true });
  }

  @Get(':slug')
  findOne(@Param('slug') slug: string) {
    return this.service.findBySlug(slug);
  }

  // Admin
  @Post()
  create(@Body() dto: CreateBlogDto) { return this.service.create(dto); }
  @Put(':id')
  update(@Param('id') id: number, @Body() dto: UpdateBlogDto) { return this.service.update(Number(id), dto); }
  @Delete(':id')
  remove(@Param('id') id: number) { return this.service.delete(Number(id)); }
}

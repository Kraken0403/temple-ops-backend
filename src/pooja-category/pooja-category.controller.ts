import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post } from '@nestjs/common'
import { PoojaCategoryService } from './pooja-category.service'

@Controller(['pooja-category', 'pooja-categories'])
export class PoojaCategoryController {
  constructor(private readonly svc: PoojaCategoryService) {}

  @Post()
  create(@Body() dto: { name: string; slug?: string; description?: string; isActive?: boolean }) {
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
    @Body() dto: Partial<{ name: string; slug: string; description?: string; isActive?: boolean }>
  ) {
    return this.svc.update(id, dto)
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.svc.remove(id)
  }
}

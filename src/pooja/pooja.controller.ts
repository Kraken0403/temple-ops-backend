import { Controller, Get, Post, Patch, Delete, Param, ParseIntPipe, Body, Query, BadRequestException } from '@nestjs/common'
import { PoojaService } from './pooja.service'
import { CreatePoojaJsonDto } from './dto/create-pooja-json.dto'
import { UpdatePoojaDto } from './dto/update-pooja.dto'

@Controller('pooja')
export class PoojaController {
  constructor(private readonly svc: PoojaService) {}

  @Get()
  findAll() { return this.svc.findAll() }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) { return this.svc.findOne(id) }

  @Post()
  create(@Body() dto: CreatePoojaJsonDto) { return this.svc.createFromJson(dto) }

  @Patch(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdatePoojaDto) {
    return this.svc.updateFromJson(id, dto)
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number, @Query('force') force?: string) {
    return this.svc.remove(id, force === 'true')
  }

  // Media helpers
  @Patch(':id/featured-media')
  setFeatured(@Param('id', ParseIntPipe) id: number, @Body('mediaId') mediaId?: number | null) {
    if (mediaId !== null && mediaId !== undefined && Number.isNaN(Number(mediaId))) {
      throw new BadRequestException('mediaId must be a number or null')
    }
    return this.svc.setFeaturedMedia(id, mediaId ?? null)
  }

  @Post(':id/gallery')
  addGallery(@Param('id', ParseIntPipe) id: number, @Body('mediaIds') mediaIds: number[]) {
    return this.svc.addToGallery(id, mediaIds ?? [])
  }

  @Patch(':id/gallery')
  reorderGallery(@Param('id', ParseIntPipe) id: number, @Body() orders: { mediaId: number; sortOrder: number }[]) {
    return this.svc.reorderGallery(id, orders ?? [])
  }

  @Delete(':id/gallery/:mediaId')
  removeGallery(@Param('id', ParseIntPipe) id: number, @Param('mediaId', ParseIntPipe) mediaId: number) {
    return this.svc.removeFromGallery(id, mediaId)
  }
}

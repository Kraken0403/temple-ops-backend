import { Controller, Get, Param, Post, Patch, Delete, Body, Query } from '@nestjs/common'
import { AlbumsService } from './albums.service'
import { CreateAlbumDto } from './dtos/create-album.dto'
import { UpdateAlbumDto } from './dtos/update-album.dto'
import { AddItemsDto } from './dtos/add-items.dto'
import { ReorderItemsDto } from './dtos/reorder-items.dto'
import { ListQueryDto } from '../shared/dtos/list-query.dto'

@Controller('albums')
export class AlbumsController {
  constructor(private readonly service: AlbumsService) {}

  @Get()
  list(@Query() q: ListQueryDto) { return this.service.list(q) }

  @Get(':slug')
  bySlug(@Param('slug') slug: string) { return this.service.bySlug(slug) }

  @Post()
  create(@Body() dto: CreateAlbumDto) { return this.service.create(dto) }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateAlbumDto) { return this.service.update(+id, dto) }

  @Delete(':id')
  remove(@Param('id') id: string) { return this.service.remove(+id) }

  @Post(':id/items')
  addItems(@Param('id') id: string, @Body() dto: AddItemsDto) { return this.service.addItems(+id, dto.mediaIds) }

  @Patch(':id/items/reorder')
  reorder(@Param('id') id: string, @Body() dto: ReorderItemsDto) { return this.service.reorder(+id, dto.order) }

  @Delete(':id/items/:itemId')
  removeItem(@Param('id') id: string, @Param('itemId') itemId: string) { return this.service.removeItem(+id, +itemId) }
}

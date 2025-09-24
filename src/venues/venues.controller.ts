import { Body, Controller, Delete, Get, Param, Post, Put } from '@nestjs/common'
import { VenuesService } from './venues.service'
import { CreateVenueDto } from './dto/create-venue.dto'
import { UpdateVenueDto } from './dto/update-venue.dto'

// If you use guards/permissions, plug them here (e.g., @UseGuards(AuthGuard, PermissionsGuard))
// and annotate with your permission keys like @Permissions('venues.read'), etc.

@Controller('venues')
export class VenuesController {
  constructor(private readonly venuesService: VenuesService) {}

  @Get()
  findAll() {
    return this.venuesService.findAll()
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.venuesService.findOne(Number(id))
  }

  @Post()
  create(@Body() body: CreateVenueDto) {
    return this.venuesService.create(body)
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() body: UpdateVenueDto) {
    return this.venuesService.update(Number(id), body)
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.venuesService.remove(Number(id))
  }
}

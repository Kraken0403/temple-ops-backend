import {
    Controller,
    Get,
    Param,
    ParseIntPipe,
    UseGuards,
  } from '@nestjs/common'
  import { ApiBearerAuth, ApiTags } from '@nestjs/swagger'
  import { JwtAuthGuard } from '../auth/jwt-auth.guard'
  import { EventOccurrencesService } from './event-occurrences.service'
  
  @ApiTags('Event Occurrences')
  @Controller('event-occurrences')
  export class EventOccurrencesController {
    constructor(
      private readonly occurrencesService: EventOccurrencesService,
    ) {}
  
    /* =========================
       ADMIN: BOOKINGS BY OCCURRENCE
       (protected)
    ========================= */
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard)
    @Get(':id/bookings')
    getBookingsForOccurrence(
      @Param('id', ParseIntPipe) id: number,
    ) {
      return this.occurrencesService.getBookings(id)
    }
  }
  
import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  Delete,
  ParseIntPipe,
  NotFoundException,
  Patch,
  Query,
} from '@nestjs/common'
import { SponsorshipService } from './sponsorship.service'
import { CreateSponsorshipTypeDto } from './dto/create-sponsorship-type.dto'
import { CreateEventSponsorshipDto } from './dto/create-event-sponsorship.dto'
import { CreateSponsorshipBookingDto } from './dto/create-sponsorship-booking.dto'
import { UpdateSponsorshipTypeDto } from './dto/update-sponsorship-type.dto'
import { UpdateEventSponsorshipDto } from './dto/update-event-sponsorship.dto'
import { UpdateSponsorshipBookingDto } from './dto/update-sponsorship-booking.dto'

@Controller('sponsorship')
export class SponsorshipController {
  constructor(private svc: SponsorshipService) {}

  // 1. Create sponsorship type (admin)
  @Post('type')
  createType(@Body() dto: CreateSponsorshipTypeDto) {
    return this.svc.createType(dto)
  }

  // 1b. Update sponsorship type (admin)
  @Patch('type/:id')
  updateType(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateSponsorshipTypeDto,
  ) {
    return this.svc.updateType(id, dto)
  }

  // 2. Assign sponsorship type to an event (admin)
  @Post('event')
  assignToEvent(@Body() dto: CreateEventSponsorshipDto) {
    return this.svc.assignToEvent(dto)
  }

  // 2b. Update an event sponsorship (admin) — by EventSponsorship `id`
  @Patch('event/:eventSponsorshipId')
  updateEventSponsorship(
    @Param('eventSponsorshipId', ParseIntPipe) eventSponsorshipId: number,
    @Body() dto: UpdateEventSponsorshipDto,
  ) {
    return this.svc.updateEventSponsorship(eventSponsorshipId, dto)
  }

  // list all event sponsorship rows
  @Get('events')
  getAllEventSponsorships() {
    return this.svc.getAllEventSponsorships()
  }

  // list all sponsorship types (admin)
  @Get('types')
  getAllTypes() {
    return this.svc.getAllTypes()
  }

  // 3. Book sponsorship (public)
  @Post('book')
  book(@Body() dto: CreateSponsorshipBookingDto) {
    return this.svc.book(dto)
  }

  // 3b. Update booking (optional; admin or authorized staff)
  @Patch('booking/:id')
  updateBooking(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateSponsorshipBookingDto,
  ) {
    return this.svc.updateBooking(id, dto)
  }

  @Get('bookings')
  async getAllBookings() {
    return this.svc.getAllBookings()
  }

  @Get(':id')
  async getEventSponsorshipById(@Param('id', ParseIntPipe) id: number) {
    const sponsorship = await this.svc.getEventSponsorshipById(id)
    if (!sponsorship) {
      throw new NotFoundException('Sponsorship not found')
    }
    return sponsorship
  }

  // 4. Get all sponsorships for a specific event (public)
  @Get('event/:eventId')
  async getSponsorships(@Param('eventId', ParseIntPipe) eventId: number) {
    const sponsorships = await this.svc.getSponsorshipsForEvent(eventId)
    if (!sponsorships || sponsorships.length === 0) {
      throw new NotFoundException('No sponsorships found for this event')
    }
    return sponsorships
  }

  @Delete('type/:id')
  async deleteType(
    @Param('id', ParseIntPipe) id: number,
    @Query('force') force?: string,
  ) {
    const doForce = force === 'true'
    if (doForce) {
      return this.svc.deleteTypeForce(id)
    }
    return this.svc.deleteTypeSafe(id)
  }

  /** Delete an EVENT SPONSORSHIP by its ID (also removes its bookings). */
  @Delete('event/by-id/:id')
  deleteEventSponsorshipById(@Param('id', ParseIntPipe) id: number) {
    return this.svc.deleteEventSponsorshipById(id)
  }

  /** Delete by composite key (eventId + sponsorshipTypeId). */
  @Delete('event/:eventId/:sponsorshipTypeId')
  removeSponsorshipAssignment(
    @Param('eventId', ParseIntPipe) eventId: number,
    @Param('sponsorshipTypeId', ParseIntPipe) sponsorshipTypeId: number,
  ) {
    return this.svc.removeSponsorshipAssignment(eventId, sponsorshipTypeId)
  }

  /** Delete a BOOKING by its ID. */
  @Delete('booking/:id')
  deleteBooking(@Param('id', ParseIntPipe) id: number) {
    return this.svc.deleteBooking(id)
  }
}

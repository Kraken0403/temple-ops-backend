import {
    Controller,
    Post,
    Body,
    Get,
    Param,
    Delete,
    ParseIntPipe,
    NotFoundException
  } from '@nestjs/common';
  import { SponsorshipService } from './sponsorship.service';
  import { CreateSponsorshipTypeDto } from './dto/create-sponsorship-type.dto';
  import { CreateEventSponsorshipDto } from './dto/create-event-sponsorship.dto';
  import { CreateSponsorshipBookingDto } from './dto/create-sponsorship-booking.dto';
  
  @Controller('sponsorship')
  export class SponsorshipController {
    constructor(private svc: SponsorshipService) {}
  
    // 1. Create sponsorship type (admin)
    @Post('type')
    createType(@Body() dto: CreateSponsorshipTypeDto) {
      return this.svc.createType(dto);
    }
  
    // 2. Assign sponsorship type to an event (admin)
    @Post('event')
    assignToEvent(@Body() dto: CreateEventSponsorshipDto) {
      return this.svc.assignToEvent(dto);
    }

    @Get('events')
        getAllEventSponsorships() {
        return this.svc.getAllEventSponsorships()
    }

    // 5. Get all sponsorship types (admin)
    @Get('types')
        getAllTypes() {
        return this.svc.getAllTypes()
    }

  
    // 3. Book sponsorship (public)
    @Post('book')
    book(@Body() dto: CreateSponsorshipBookingDto) {
      return this.svc.book(dto);
    }

    @Get('bookings')
    async getAllBookings() {
        return this.svc.getAllBookings();
    }

    @Get(':id')
    async getEventSponsorshipById(@Param('id', ParseIntPipe) id: number) {
    const sponsorship = await this.svc.getEventSponsorshipById(id);
    if (!sponsorship) {
        throw new NotFoundException('Sponsorship not found');
    }
    return sponsorship;
    }
            
  
    // 4. Get all sponsorships for a specific event (public)
    @Get('event/:eventId')
    async getSponsorships(@Param('eventId', ParseIntPipe) eventId: number) {
      const sponsorships = await this.svc.getSponsorshipsForEvent(eventId);
      if (!sponsorships || sponsorships.length === 0) {
        throw new NotFoundException('No sponsorships found for this event');
      }
      return sponsorships;
    }

    @Delete('event/:eventId/:sponsorshipTypeId')
    async removeSponsorshipAssignment(
      @Param('eventId', ParseIntPipe) eventId: number,
      @Param('sponsorshipTypeId', ParseIntPipe) sponsorshipTypeId: number,
    ) {
      return this.svc.removeSponsorshipAssignment(eventId, sponsorshipTypeId);
    }
  }
  
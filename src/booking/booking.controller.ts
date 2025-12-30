import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  ParseIntPipe,
  NotFoundException,
  Patch,
  Delete,
  Req,
  BadRequestException,
  ForbiddenException,
  Query,
  Logger,
  UseGuards,
} from '@nestjs/common'
import { AuthGuard } from '@nestjs/passport'
import { BookingService } from './booking.service'
import { CreateBookingDto } from './dto/create-booking.dto'
import { UpdateBookingDto } from './dto/update-booking.dto'
import { QuoteBookingDto } from './dto/quote-booking.dto'
import { PrismaService } from '../prisma.service'

@Controller('booking')
export class BookingController {
  private readonly logger = new Logger(BookingController.name)

  constructor(
    private readonly svc: BookingService,
    private readonly prisma: PrismaService,
  ) {}

  /* ─────────────── PUBLIC (GUEST ALLOWED) ─────────────── */

  /**
   * ✅ Pricing preview
   * Guests + logged-in users
   */
  @Post('quote')
  quote(@Body() dto: QuoteBookingDto) {
    return this.svc.quote(dto)
  }

  /**
   * ✅ Create booking
   * Guests + logged-in users
   */
  @Post()
  create(@Body() dto: CreateBookingDto) {
    // console.log('📥 CREATE BOOKING DTO:', dto)
    return this.svc.create(dto)
  }

  /* ─────────────── AUTH REQUIRED ─────────────── */

  /**
   * Priest “My Bookings”
   */
  @Get('my')
  @UseGuards(AuthGuard('jwt'))
  async findMine(@Req() req: any, @Query('priestId') priestIdQuery?: string) {
    const user = req?.user
    this.logger.debug(`booking/my user: ${JSON.stringify(user)}`)

    const isAdmin = await this.isAdminDb(user?.id)

    let priestId: number | null = null

    if (isAdmin && priestIdQuery) {
      const parsed = Number(priestIdQuery)
      if (!Number.isFinite(parsed) || parsed <= 0) {
        throw new BadRequestException('Query param priestId must be a positive number')
      }
      priestId = parsed
    } else {
      priestId = await this.resolvePriestIdFromDb(user)
    }

    if (!priestId) {
      throw new ForbiddenException(
        'Your account is not linked to a Priest profile.'
      )
    }

    return this.svc.findAllByPriest(priestId)
  }

  /**
   * Admin / staff overview
   */
  @Get()
  @UseGuards(AuthGuard('jwt'))
  findAll() {
    return this.svc.findAll()
  }

  /**
   * View single booking (admin / priest)
   */
  @Get(':id')
  @UseGuards(AuthGuard('jwt'))
  async findOne(@Param('id', ParseIntPipe) id: number) {
    const booking = await this.svc.findOne(id)
    if (!booking) throw new NotFoundException('Booking not found')
    return booking
  }

  /**
   * Update booking
   */
  @Patch(':id')
  @UseGuards(AuthGuard('jwt'))
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateBookingDto,
  ) {
    const updated = await this.svc.update(id, dto)
    if (!updated) throw new NotFoundException('Booking not found')
    return updated
  }

  /**
   * Update booking status
   */
  @Patch(':id/status/:status')
  @UseGuards(AuthGuard('jwt'))
  updateStatus(
    @Param('id', ParseIntPipe) id: number,
    @Param('status') status: string,
  ) {
    return this.svc.update(id, { status } as UpdateBookingDto)
  }

  /**
   * Delete booking
   */
  @Delete(':id')
  @UseGuards(AuthGuard('jwt'))
  async remove(@Param('id', ParseIntPipe) id: number) {
    await this.svc.remove(id)
    return { ok: true }
  }

  /* ─────────────── Helpers ─────────────── */

  private async isAdminDb(userId?: number | string | null): Promise<boolean> {
    if (!userId) return false
    const uid = Number(userId)
    if (!Number.isFinite(uid)) return false

    const roles = await this.prisma.userRole.findMany({
      where: { userId: uid },
      include: { role: true },
    })

    return roles.some(r => r.role?.name?.toLowerCase() === 'admin')
  }

  private async resolvePriestIdFromDb(user: any): Promise<number | null> {
    if (!user?.id) return null
    const uid = Number(user.id)
    if (!Number.isFinite(uid)) return null

    const u = await this.prisma.user.findUnique({
      where: { id: uid },
      select: { priestId: true, email: true },
    })

    if (u?.priestId) return u.priestId

    if (u?.email) {
      const p = await this.prisma.priest.findFirst({
        where: { email: u.email },
        select: { id: true },
      })
      return p?.id ?? null
    }

    return null
  }
}

// src/booking/booking.controller.ts
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
import { PrismaService } from '../prisma.service'

@Controller('booking')
@UseGuards(AuthGuard('jwt')) // ensures req.user is populated
export class BookingController {
  private readonly logger = new Logger(BookingController.name)

  constructor(
    private readonly svc: BookingService,
    private readonly prisma: PrismaService,
  ) {}

  /* ─────────────── Create / Read standard ─────────────── */

  @Post()
  create(@Body() dto: CreateBookingDto) {
    return this.svc.create(dto)
  }

  /**
   * IMPORTANT: Place the `/my` route BEFORE `/:id`
   * so `"my"` won't be parsed by ParseIntPipe.
   *
   * Priest “My Bookings”
   * - Non-admins: see only your bookings, resolved by users.priestId (or fallback via email).
   * - Admins: can pass `?priestId=123` to view a specific priest’s bookings.
   */
  @Get('my')
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
        'Your account is not linked to a Priest profile. Ask an admin to set users.priestId for your user.'
      )
    }

    // Use the service so we get timezone conversions like other endpoints
    return this.svc.findAllByPriest(priestId)
  }

  // Admin/staff overview (or keep open if you intend)
  @Get()
  findAll() {
    return this.svc.findAll()
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    const booking = await this.svc.findOne(id)
    if (!booking) throw new NotFoundException('Booking not found')
    return booking
  }

  /* ─────────────── Update / Delete ─────────────── */

  @Patch(':id')
  async update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateBookingDto) {
    const updated = await this.svc.update(id, dto)
    if (!updated) throw new NotFoundException('Booking not found')
    return updated
  }

  @Patch(':id/status/:status')
  async updateStatus(@Param('id', ParseIntPipe) id: number, @Param('status') status: string) {
    return this.svc.update(id, { status } as UpdateBookingDto)
  }

  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number) {
    await this.svc.remove(id)
    return { ok: true }
  }

  /* ─────────────── Helpers (DB-based) ─────────────── */

  private async isAdminDb(userId?: number | string | null): Promise<boolean> {
    if (!userId) return false
    const uid = Number(userId)
    if (!Number.isFinite(uid)) return false

    const roles = await this.prisma.userRole.findMany({
      where: { userId: uid },
      include: { role: true },
    })
    return roles.some(r => r.role?.name?.toLowerCase?.() === 'admin')
  }

  private async resolvePriestIdFromDb(user: any): Promise<number | null> {
    if (!user?.id) return null
    const uid = Number(user.id)
    if (!Number.isFinite(uid)) return null

    const u = await this.prisma.user.findUnique({
      where: { id: uid },
      select: { priestId: true, email: true },
    })
    if (u?.priestId) return Number(u.priestId)

    // Optional email fallback
    if (u?.email) {
      const p = await this.prisma.priest.findFirst({
        where: { email: u.email },
        select: { id: true },
      })
      if (p?.id) return p.id
    }
    return null
  }
}

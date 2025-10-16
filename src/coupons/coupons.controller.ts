import { Controller, Get, Post, Patch, Delete, Param, ParseIntPipe, Body, Query } from '@nestjs/common'
import { CouponsService } from './coupons.service'
import { CreateCouponDto } from './dto/create-coupon.dto'
import { UpdateCouponDto } from './dto/update-coupon.dto'
import { ValidateCouponQueryDto } from './dto/validate-coupon.dto'

@Controller()
export class CouponsController {
  constructor(private readonly svc: CouponsService) {}

  /* ───────────── Admin CRUD ───────────── */

  @Post('coupons')
  create(@Body() dto: CreateCouponDto) {
    return this.svc.create(dto)
  }

  @Get('coupons')
  findAll(
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
    @Query('search') search?: string,
    @Query('active') active?: string, // 'true' | 'false' | undefined
  ) {
    return this.svc.findAll({
      page,
      pageSize,
      search,
      active: active === undefined ? undefined : active === 'true',
    })
  }

  @Get('coupons/:id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.svc.findOne(id)
  }

  @Patch('coupons/:id')
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateCouponDto) {
    return this.svc.update(id, dto)
  }

  @Delete('coupons/:id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.svc.remove(id)
  }

  /* ───────────── Public validate ───────────── */

  @Get('coupons/validate/:code')
  validate(@Param('code') code: string, @Query() q: ValidateCouponQueryDto) {
    return this.svc.validateAndQuote(code, q)
  }
}

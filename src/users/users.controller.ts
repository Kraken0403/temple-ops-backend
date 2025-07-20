import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Controller('users')
export class UsersController {
  constructor(private readonly svc: UsersService) {}

  @Get()         findAll()   { return this.svc.findAll(); }
  @Get(':id')    findOne(@Param('id', ParseIntPipe) id: number) { return this.svc.findOne(id); }
  @Post()        create(@Body() dto: CreateUserDto)             { return this.svc.create(dto); }
  @Patch(':id')  update(@Param('id', ParseIntPipe) id:number, @Body() dto: UpdateUserDto) { return this.svc.update(id, dto); }
  @Delete(':id') remove(@Param('id', ParseIntPipe) id:number)   { return this.svc.remove(id); }
}

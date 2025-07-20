import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe } from '@nestjs/common';
import { RolesService } from './roles.service';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';

@Controller('roles')
export class RolesController {
  constructor(private readonly svc: RolesService) {}

  @Get()         findAll()       { return this.svc.findAll(); }
  @Get(':id')    findOne(@Param('id', ParseIntPipe) id: number) { return this.svc.findOne(id); }
  @Post()        create(@Body() dto: CreateRoleDto)             { return this.svc.create(dto); }
  @Patch(':id')  update(@Param('id', ParseIntPipe) id:number, @Body() dto: UpdateRoleDto) { return this.svc.update(id, dto); }
  @Delete(':id') remove(@Param('id', ParseIntPipe) id:number)   { return this.svc.remove(id); }
}

import {
    Controller,
    Get,
    Post,
    Delete,
    Param,
    ParseIntPipe,
    Body,
  } from '@nestjs/common';
  import { RoleUsersService } from './role-users.service';
  import { AssignUserDto } from './dto/assign-user.dto';
  
  @Controller('roles/:roleId/users')
  export class RoleUsersController {
    constructor(private readonly svc: RoleUsersService) {}
  
    @Get()
    findAll(@Param('roleId', ParseIntPipe) roleId: number) {
      return this.svc.findByRole(roleId);
    }
  
    @Post()
    assign(
      @Param('roleId', ParseIntPipe) roleId: number,
      @Body() { userId }: AssignUserDto,
    ) {
      return this.svc.assign(roleId, userId);
    }
  
    @Delete(':userId')
    remove(
      @Param('roleId', ParseIntPipe) roleId: number,
      @Param('userId', ParseIntPipe) userId: number,
    ) {
      return this.svc.remove(roleId, userId);
    }
  }
  
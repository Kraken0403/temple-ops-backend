import {
    Controller,
    Get,
    Post,
    Body,
    Param,
    Delete,
    ParseIntPipe,
  } from '@nestjs/common';
  import { RolePermissionsService } from './role-permissions.service';
  import { AssignPermissionDto } from './dto/assign-permission.dto';
  
  @Controller('roles/:roleId/permissions')
  export class RolePermissionsController {
    constructor(private readonly svc: RolePermissionsService) {}
  
    @Get()
    find(@Param('roleId', ParseIntPipe) roleId: number) {
      return this.svc.findByRole(roleId);
    }
  
    @Post()
    assign(
      @Param('roleId', ParseIntPipe) roleId: number,
      @Body() dto: AssignPermissionDto
    ) {
      return this.svc.assign(roleId, dto.permissionIds);
    }
  
    @Delete(':permissionId')
    remove(
      @Param('roleId', ParseIntPipe) roleId: number,
      @Param('permissionId', ParseIntPipe) permissionId: number
    ) {
      return this.svc.remove(roleId, permissionId);
    }
  }
  
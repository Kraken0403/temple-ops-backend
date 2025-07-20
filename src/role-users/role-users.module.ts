// src/role-users/role-users.module.ts

import { Module } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { RoleUsersController } from './role-users.controller';
import { RoleUsersService } from './role-users.service'

@Module({
  controllers: [RoleUsersController],
  providers: [RoleUsersService, PrismaService],
  exports: [RoleUsersService],
})
export class RoleUsersModule {}

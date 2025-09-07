// src/roles/roles.service.ts
import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';

@Injectable()
export class RolesService {
  constructor(private prisma: PrismaService) {}

  findAll() {
    return this.prisma.role.findMany();
  }

  findOne(id: number) {
    return this.prisma.role.findUnique({ where: { id } });
  }

  create(dto: CreateRoleDto) {
    return this.prisma.role.create({ data: dto });
  }

  async update(id: number, dto: UpdateRoleDto) {
    const existing = await this.prisma.role.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException(`Role ${id} not found`);

    // block renaming the admin role or renaming *to* admin
    if (existing.name.toLowerCase() === 'admin') {
      throw new BadRequestException('The "admin" role cannot be renamed.');
    }
    if (dto.name && dto.name.toLowerCase() === 'admin') {
      throw new BadRequestException('Cannot rename a role to "admin".');
    }

    return this.prisma.role.update({ where: { id }, data: dto });
  }

  async remove(id: number) {
    const r = await this.prisma.role.findUnique({ where: { id } });
    if (!r) throw new NotFoundException(`Role ${id} not found`);
    return this.prisma.role.delete({ where: { id } });
  }
}

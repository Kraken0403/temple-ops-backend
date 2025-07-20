import { Injectable, NotFoundException } from '@nestjs/common';
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
    await this.ensureExists(id);
    return this.prisma.role.update({ where: { id }, data: dto });
  }

  async remove(id: number) {
    await this.ensureExists(id);
    return this.prisma.role.delete({ where: { id } });
  }

  private async ensureExists(id: number) {
    const r = await this.prisma.role.findUnique({ where: { id } });
    if (!r) throw new NotFoundException(`Role ${id} not found`);
  }
}

import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { CreatePermissionDto } from './dto/create-permission.dto';
import { UpdatePermissionDto } from './dto/update-permission.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class PermissionsService {
  constructor(private prisma: PrismaService) {}

  /** 
   * Create a new permission, or return the existing one if the name is already taken
   */
  async create(dto: CreatePermissionDto) {
    try {
      return await this.prisma.permission.create({ data: dto });
    } catch (e: any) {
      if (
        e instanceof Prisma.PrismaClientKnownRequestError &&
        e.code === 'P2002' &&
        e.meta?.target === 'Permission_name_key'
      ) {
        // Unique constraint failed on Permission.name → fetch and return existing
        return this.prisma.permission.findUniqueOrThrow({
          where: { name: dto.name },
        });
      }
      throw e;
    }
  }

  findAll() {
    return this.prisma.permission.findMany();
  }

  async findOne(id: number) {
    const p = await this.prisma.permission.findUnique({ where: { id } });
    if (!p) throw new NotFoundException(`Permission ${id} not found`);
    return p;
  }

  async update(id: number, dto: UpdatePermissionDto) {
    await this.findOne(id);
    return this.prisma.permission.update({ where: { id }, data: dto });
  }

  async remove(id: number) {
    await this.findOne(id);
    return this.prisma.permission.delete({ where: { id } });
  }
}

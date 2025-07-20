import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.user.findMany({ include: { roles: { include: { role: true } } } });
  }

  async findOne(id: number) {
    return this.prisma.user.findUnique({
      where: { id },
      include: { roles: { include: { role: true } } }
    });
  }

  async create(dto: CreateUserDto) {
    const hash = await bcrypt.hash(dto.password, 10);
    return this.prisma.user.create({
      data: {
        email: dto.email,
        password: hash,
        roles: {
          create: dto.roles.map(roleId => ({ role: { connect: { id: roleId } } }))
        }
      },
      include: { roles: { include: { role: true } } }
    });
  }

  async update(id: number, dto: UpdateUserDto) {
    await this.ensureExists(id);
    const data: any = { email: dto.email };
    if (dto.password) data.password = await bcrypt.hash(dto.password, 10);
    if (dto.roles) {
      data.roles = {
        deleteMany: {}, // clear existing
        create: dto.roles.map(rid => ({ role: { connect: { id: rid } } }))
      };
    }
    return this.prisma.user.update({
      where: { id },
      data,
      include: { roles: { include: { role: true } } }
    });
  }

  async remove(id: number) {
    await this.ensureExists(id);
    return this.prisma.user.delete({ where: { id } });
  }

  private async ensureExists(id: number) {
    const u = await this.prisma.user.findUnique({ where: { id } });
    if (!u) throw new NotFoundException(`User ${id} not found`);
  }
}

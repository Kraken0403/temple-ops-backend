import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { CreatePageDto } from './dto/create-page.dto';
import { UpdatePageDto } from './dto/update-page.dto';

@Injectable()
export class PagesService {
  constructor(private prisma: PrismaService) {}

  findAll() {
    return this.prisma.page.findMany({ orderBy: { updatedAt: 'desc' } });
  }

  async findOne(id: string) {
    const page = await this.prisma.page.findUnique({ where: { id } });
    if (!page) throw new NotFoundException(`Page ${id} not found`);
    return page;
  }

  async findBySlug(slug: string) {
    const page = await this.prisma.page.findUnique({ where: { slug } });
    if (!page) throw new NotFoundException(`Page “${slug}” not found`);
    return page;
  }

  create(dto: CreatePageDto) {
    return this.prisma.page.create({ data: dto });
  }

  async update(id: string, dto: UpdatePageDto) {
    await this.findOne(id);
    return this.prisma.page.update({ where: { id }, data: dto });
  }

  async remove(id: string) {
    await this.findOne(id);
    await this.prisma.page.delete({ where: { id } });
    return { success: true };
  }
}

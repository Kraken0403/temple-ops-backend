import { Module } from '@nestjs/common';
import { PagesService } from './pages.service';
import { PagesController } from './pages.controller';
import { PrismaService } from '../prisma.service';

@Module({
  controllers: [PagesController],
  providers: [PagesService, PrismaService],
  exports: [PagesService],
})
export class PagesModule {}

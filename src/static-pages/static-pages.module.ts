import { Module } from '@nestjs/common';
import { StaticPagesController } from './static-pages.controller';
import { StaticPagesService } from './static-pages.service';
import { PrismaService } from '../prisma.service';

@Module({
  controllers: [StaticPagesController],
  providers: [StaticPagesService, PrismaService],
})
export class StaticPagesModule {}

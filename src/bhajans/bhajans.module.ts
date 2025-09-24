import { Module } from '@nestjs/common';
import { BhajansService } from './bhajans.service';
import { BhajansController } from './bhajans.controller';
import { PrismaService } from '../prisma.service';

@Module({
  controllers: [BhajansController],
  providers: [BhajansService, PrismaService],
  exports: [BhajansService],
})
export class BhajansModule {}

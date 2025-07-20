import { Module } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { PriestService } from './priest.service';
import { PriestController } from './priest.controller';

@Module({
  providers: [PriestService, PrismaService],
  controllers: [PriestController],
})
export class PriestModule {}

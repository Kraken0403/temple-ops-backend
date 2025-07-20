// src/pooja/pooja.module.ts
import { Module }           from '@nestjs/common';
import { PrismaService }    from '../prisma.service';
import { PoojaService }     from './pooja.service';
import { PoojaController }  from './pooja.controller';

@Module({
  controllers: [PoojaController],
  providers:   [PoojaService, PrismaService],
})
export class PoojaModule {}

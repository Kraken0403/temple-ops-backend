import { Module } from '@nestjs/common'
import { PrismaService } from '../prisma.service'
import { PoojaCategoryService } from './pooja-category.service'
import { PoojaCategoryController } from './pooja-category.controller'

@Module({
  providers: [PrismaService, PoojaCategoryService],
  controllers: [PoojaCategoryController],
  exports: [PoojaCategoryService],
})
export class PoojaCategoryModule {}

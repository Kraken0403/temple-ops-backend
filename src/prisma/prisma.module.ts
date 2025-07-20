// src/prisma/prisma.module.ts
import { Global, Module } from '@nestjs/common'
import { PrismaService } from '../prisma.service'

@Global() // so you don't have to import this module everywhere
@Module({
  providers: [PrismaService],
  exports: [PrismaService],
})
export class PrismaModule {}

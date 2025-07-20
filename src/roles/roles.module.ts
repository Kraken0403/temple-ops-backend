import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { RolesService } from './roles.service';
import { RolesController } from './roles.controller';

@Module({
  imports: [PrismaModule],     // <- correct
  providers: [RolesService],
  controllers: [RolesController],
})
export class RolesModule {}

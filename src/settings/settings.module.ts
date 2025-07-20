// src/settings/settings.module.ts
import { Module } from '@nestjs/common'
import { SettingsService } from './settings.service'
import { SettingsController } from './settings.controller'

@Module({
  imports: [], // PrismaModule is global, no need to import
  providers: [SettingsService],
  controllers: [SettingsController],
})
export class SettingsModule {}

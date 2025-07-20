import { Controller, Get, Post, Body } from '@nestjs/common';
import { SettingsService } from './settings.service';

@Controller('settings')
export class SettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  @Get()
  async getSettings() {
    return this.settingsService.getSettings();
  }

  @Post()
  async updateSettings(@Body() body: { currency: string }) {
    return this.settingsService.updateSettings(body);
  }
}

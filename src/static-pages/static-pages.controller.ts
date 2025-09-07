// src/static-pages/static-pages.controller.ts
import {
  Controller,
  Get,
  Put,
  Param,
  Body,
  NotFoundException,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { StaticPagesService } from './static-pages.service';

@Controller('static-pages')
export class StaticPagesController {
  constructor(private readonly svc: StaticPagesService) {}

  // Public route to fetch page content
  @Get(':slug')
  async getPage(@Param('slug') slug: string) {
    const page = await this.svc.getPage(slug);
    if (!page) throw new NotFoundException('Page not found');
    return page;
  }

  // Admin route to update page content
  @Put(':slug')
  async updatePage(
    @Param('slug') slug: string,
    @Body() body: { content: any }
  ) {
    return this.svc.updatePage(slug, body.content);
  }

  // ✅ File upload (same pattern as events)
  @Post('upload-photo')
  @UseInterceptors(FileInterceptor('file'))
  async uploadPhoto(@UploadedFile() file: Express.Multer.File) {
    const url = await this.svc.savePhotoAndGetUrl(file);
    return { url };
  }
}

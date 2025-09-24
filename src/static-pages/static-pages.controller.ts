// src/static-pages/static-pages.controller.ts
import {
  Controller, Get, Put, Post, Delete,
  Param, Body, NotFoundException, UploadedFile, UseInterceptors
} from '@nestjs/common'
import { FileInterceptor } from '@nestjs/platform-express'
import { StaticPagesService } from './static-pages.service'

@Controller('static-pages')
export class StaticPagesController {
  constructor(private readonly svc: StaticPagesService) {}

  @Get(':slug')
  async getPage(@Param('slug') slug: string) {
    const page = await this.svc.getPage(slug)
    if (!page) throw new NotFoundException('Page not found')
    return page
  }

  // ✅ Create (frontend calls this when first saving)
  @Post()
  async createPage(@Body() body: { slug: string; content?: any }) {
    return this.svc.createPage(body.slug, body.content ?? {})
  }

  // ✅ Update (now safe via upsert)
  @Put(':slug')
  async updatePage(@Param('slug') slug: string, @Body() body: { content: any }) {
    return this.svc.updatePage(slug, body.content ?? {})
  }

  // Upload photo used inside the editor HTML
  @Post('upload-photo')
  @UseInterceptors(FileInterceptor('file')) // memory storage OK if you use your manual write
  async uploadPhoto(@UploadedFile() file: Express.Multer.File) {
    const url = await this.svc.savePhotoAndGetUrl(file)
    return { url } // => "/uploads/..."
  }
}

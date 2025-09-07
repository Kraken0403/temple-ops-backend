import { Controller, Get, Post, Query, UseInterceptors, UploadedFile } from '@nestjs/common'
import { FileInterceptor } from '@nestjs/platform-express'
import { MediaService } from './media.service'
import { mediaStorage } from './media.storage'

@Controller('media')
export class MediaController {
  constructor(private readonly service: MediaService) {}

  @Get()
  list(
    @Query('q') q?: string,
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
    @Query('rescan') rescan?: string,
  ) {
    return this.service.list({ q, page, pageSize, rescan })
  }

  @Post('upload')
  @UseInterceptors(FileInterceptor('file', { storage: mediaStorage }))
  upload(@UploadedFile() file: Express.Multer.File) {
    return this.service.saveUploadedFile(file)
  }
}

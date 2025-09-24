// src/static-pages/static-pages.service.ts
import { Injectable } from '@nestjs/common'
import { PrismaService } from '../prisma.service'
import * as fs from 'fs'
import * as path from 'path'

@Injectable()
export class StaticPagesService {
  constructor(private prisma: PrismaService) {}

  async getPage(slug: string) {
    return this.prisma.staticPage.findUnique({ where: { slug } })
  }

  async createPage(slug: string, content: any) {
    return this.prisma.staticPage.create({
      data: { slug, content: content ?? {} },
    })
  }

  // Use upsert so first save doesn't 404
  async updatePage(slug: string, content: any) {
    return this.prisma.staticPage.upsert({
      where: { slug },
      update: { content: content ?? {} },
      create: { slug, content: content ?? {} },
    })
  }

  // (You can keep this if you like a flat /uploads; see "Better upload" below)
  async savePhotoAndGetUrl(file: Express.Multer.File) {
    const uploadDir = path.join(process.cwd(), 'uploads') // align with main.ts static root
    if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true })

    const safeName = `${Date.now()}-${(file.originalname || 'file')
      .replace(/[^\w.-]+/g, '-')
      .toLowerCase()}`
    const filepath = path.join(uploadDir, safeName)
    await fs.promises.writeFile(filepath, file.buffer)

    return `/uploads/${safeName}`
  }
}

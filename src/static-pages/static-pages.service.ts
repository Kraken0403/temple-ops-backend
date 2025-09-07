// src/static-pages/static-pages.service.ts
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class StaticPagesService {
  constructor(private prisma: PrismaService) {}

  async getPage(slug: string) {
    return this.prisma.staticPage.findUnique({ where: { slug } });
  }

  async updatePage(slug: string, content: any) {
    return this.prisma.staticPage.update({
      where: { slug },
      data: { content },
    });
  }

  // ✅ Same upload handler as events
  async savePhotoAndGetUrl(file: Express.Multer.File) {
    const uploadDir = path.join(__dirname, '..', '..', 'uploads');
    if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir);

    const filename = Date.now() + '-' + file.originalname;
    const filepath = path.join(uploadDir, filename);

    await fs.promises.writeFile(filepath, file.buffer);

    return `/uploads/${filename}`;
  }
}

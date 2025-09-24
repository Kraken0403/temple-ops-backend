import { BadRequestException, Injectable, OnModuleInit } from '@nestjs/common'
import { PrismaService } from '../prisma.service'
import * as fs from 'fs/promises'
import * as path from 'path'
import { uploadRoot, ensureUploadsRoot } from './media.storage'

type ListParams = { q?: string; page?: number | string; pageSize?: number | string; rescan?: string | boolean }

const VALID = new Set(['.jpg','.jpeg','.png','.gif','.webp','.svg','.bmp','.tiff'])

function mimeFor(ext: string) {
  switch (ext) {
    case '.svg':  return 'image/svg+xml'
    case '.png':  return 'image/png'
    case '.gif':  return 'image/gif'
    case '.webp': return 'image/webp'
    case '.bmp':  return 'image/bmp'
    case '.tiff': return 'image/tiff'
    case '.pdf':  return 'application/pdf' 
    default: return 'image/jpeg'
  }
}

async function walk(dir: string, out: string[] = []) {
  const entries = await fs.readdir(dir, { withFileTypes: true })
  for (const e of entries) {
    const full = path.join(dir, e.name)
    if (e.isDirectory()) await walk(full, out)
    else out.push(full)
  }
  return out
}

@Injectable()
export class MediaService implements OnModuleInit {
  private indexedOnce = false
  private indexingPromise: Promise<void> | null = null

  constructor(private prisma: PrismaService) {}

  async onModuleInit() {
    ensureUploadsRoot()
    await this.ensureIndexed().catch(e => console.warn('[media] initial index skipped:', e?.message || e))
  }

  private async ensureIndexed(force = false) {
    if (this.indexedOnce && !force) return
    if (this.indexingPromise) return this.indexingPromise

    this.indexingPromise = (async () => {
      try { await fs.access(uploadRoot) } catch { this.indexedOnce = true; return }

      const absFiles = await walk(uploadRoot)
      const imgFiles = absFiles.filter(f => VALID.has(path.extname(f).toLowerCase()))

      const existing = await this.prisma.mediaAsset.findMany({ select: { url: true } })
      const existingSet = new Set(existing.map(r => r.url))

      const fileUrlSet = new Set<string>()
      const batch: { url: string; filename: string; mimeType: string; sizeBytes: number }[] = []

      for (const abs of imgFiles) {
        const rel = abs.replace(uploadRoot, '').replace(/\\/g, '/')
        const url = `/uploads${rel}`
        fileUrlSet.add(url)
        if (!existingSet.has(url)) {
          const stat = await fs.stat(abs)
          batch.push({
            url,
            filename: path.basename(abs),
            mimeType: mimeFor(path.extname(abs).toLowerCase()),
            sizeBytes: stat.size,
          })
        }
      }

      if (batch.length) await this.prisma.mediaAsset.createMany({ data: batch, skipDuplicates: true })

      // Purge DB rows for files that no longer exist (WordPress-like cleanup)
      const PURGE = true
      if (PURGE && existing.length) {
        const missing = [...existingSet].filter(u => !fileUrlSet.has(u))
        if (missing.length) await this.prisma.mediaAsset.deleteMany({ where: { url: { in: missing } } })
      }

      this.indexedOnce = true
    })()

    try { await this.indexingPromise } finally { this.indexingPromise = null }
  }

  async list({ q = '', page = 1, pageSize = 40, rescan = false }: ListParams) {
    const force = rescan === '1' || rescan === true
    await this.ensureIndexed(force)

    const where = q
      ? { OR: [
          { filename: { contains: String(q), mode: 'insensitive' } },
          { url: { contains: String(q), mode: 'insensitive' } },
        ]}
      : {}

    const skip = (Number(page) - 1) * Number(pageSize)
    const take = Number(pageSize)

    const [items, total] = await this.prisma.$transaction([
      this.prisma.mediaAsset.findMany({ where, orderBy: { id: 'desc' }, skip, take }),
      this.prisma.mediaAsset.count({ where }),
    ])

    return { items, total, page: Number(page), pageSize: Number(pageSize), pages: Math.ceil(total / Number(pageSize)) }
  }

  async saveUploadedFile(file: Express.Multer.File) {
    if (!file) throw new BadRequestException('File is required')

    // Where multer stored it (e.g. <root>/uploads/2025/09)
    const destAbs = file.destination || uploadRoot

    // Compute a POSIX relative folder like "2025/09"
    let relDir = path.relative(uploadRoot, destAbs).replace(/\\/g, '/')
    // Remove any accidental leading "uploads/" segments just in case
    relDir = relDir.replace(/^\/?(?:uploads\/)+/i, '')

    // Build a single, normalized URL: "/uploads/2025/09/filename.ext"
    const urlPath = path.posix.join('/uploads', relDir, file.filename)

    return this.prisma.mediaAsset.create({
      data: {
        url: urlPath,                                // <-- no duplication
        filename: file.originalname || file.filename,
        mimeType: file.mimetype,
        sizeBytes: file.size,
      },
    })
  }
}

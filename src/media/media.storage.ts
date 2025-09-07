import { diskStorage } from 'multer'
import * as fs from 'fs'
import * as path from 'path'

export const uploadRoot = path.join(process.cwd(), 'uploads')

function ensureDir(p: string) {
  if (!fs.existsSync(p)) fs.mkdirSync(p, { recursive: true })
}

export function ensureUploadsRoot() { ensureDir(uploadRoot) }

// year/month subfolders like WordPress: /uploads/2025/09
function subdir() {
  const d = new Date()
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const dir = path.join(uploadRoot, `${y}`, `${m}`)
  ensureDir(dir)
  return dir
}

export const mediaStorage = diskStorage({
  destination: (_req, _file, cb) => cb(null, subdir()),
  filename: (_req, file, cb) => {
    const ext  = path.extname(file.originalname) || ''
    const base = path.basename(file.originalname, ext).replace(/\s+/g, '-').toLowerCase()
    cb(null, `${base}-${Date.now()}${ext}`)
  },
})

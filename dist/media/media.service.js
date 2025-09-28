"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MediaService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma.service");
const fs = require("fs/promises");
const path = require("path");
const media_storage_1 = require("./media.storage");
const VALID = new Set(['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg', '.bmp', '.tiff']);
function mimeFor(ext) {
    switch (ext) {
        case '.svg': return 'image/svg+xml';
        case '.png': return 'image/png';
        case '.gif': return 'image/gif';
        case '.webp': return 'image/webp';
        case '.bmp': return 'image/bmp';
        case '.tiff': return 'image/tiff';
        case '.pdf': return 'application/pdf';
        default: return 'image/jpeg';
    }
}
async function walk(dir, out = []) {
    const entries = await fs.readdir(dir, { withFileTypes: true });
    for (const e of entries) {
        const full = path.join(dir, e.name);
        if (e.isDirectory())
            await walk(full, out);
        else
            out.push(full);
    }
    return out;
}
let MediaService = class MediaService {
    constructor(prisma) {
        this.prisma = prisma;
        this.indexedOnce = false;
        this.indexingPromise = null;
    }
    async onModuleInit() {
        (0, media_storage_1.ensureUploadsRoot)();
        await this.ensureIndexed().catch(e => console.warn('[media] initial index skipped:', e?.message || e));
    }
    async ensureIndexed(force = false) {
        if (this.indexedOnce && !force)
            return;
        if (this.indexingPromise)
            return this.indexingPromise;
        this.indexingPromise = (async () => {
            try {
                await fs.access(media_storage_1.uploadRoot);
            }
            catch {
                this.indexedOnce = true;
                return;
            }
            const absFiles = await walk(media_storage_1.uploadRoot);
            const imgFiles = absFiles.filter(f => VALID.has(path.extname(f).toLowerCase()));
            const existing = await this.prisma.mediaAsset.findMany({ select: { url: true } });
            const existingSet = new Set(existing.map(r => r.url));
            const fileUrlSet = new Set();
            const batch = [];
            for (const abs of imgFiles) {
                const rel = abs.replace(media_storage_1.uploadRoot, '').replace(/\\/g, '/');
                const url = `/uploads${rel}`;
                fileUrlSet.add(url);
                if (!existingSet.has(url)) {
                    const stat = await fs.stat(abs);
                    batch.push({
                        url,
                        filename: path.basename(abs),
                        mimeType: mimeFor(path.extname(abs).toLowerCase()),
                        sizeBytes: stat.size,
                    });
                }
            }
            if (batch.length)
                await this.prisma.mediaAsset.createMany({ data: batch, skipDuplicates: true });
            // Purge DB rows for files that no longer exist (WordPress-like cleanup)
            const PURGE = true;
            if (PURGE && existing.length) {
                const missing = [...existingSet].filter(u => !fileUrlSet.has(u));
                if (missing.length)
                    await this.prisma.mediaAsset.deleteMany({ where: { url: { in: missing } } });
            }
            this.indexedOnce = true;
        })();
        try {
            await this.indexingPromise;
        }
        finally {
            this.indexingPromise = null;
        }
    }
    async list({ q = '', page = 1, pageSize = 40, rescan = false }) {
        const force = rescan === '1' || rescan === true;
        await this.ensureIndexed(force);
        const where = q
            ? { OR: [
                    { filename: { contains: String(q), mode: 'insensitive' } },
                    { url: { contains: String(q), mode: 'insensitive' } },
                ] }
            : {};
        const skip = (Number(page) - 1) * Number(pageSize);
        const take = Number(pageSize);
        const [items, total] = await this.prisma.$transaction([
            this.prisma.mediaAsset.findMany({ where, orderBy: { id: 'desc' }, skip, take }),
            this.prisma.mediaAsset.count({ where }),
        ]);
        return { items, total, page: Number(page), pageSize: Number(pageSize), pages: Math.ceil(total / Number(pageSize)) };
    }
    async saveUploadedFile(file) {
        if (!file)
            throw new common_1.BadRequestException('File is required');
        // Where multer stored it (e.g. <root>/uploads/2025/09)
        const destAbs = file.destination || media_storage_1.uploadRoot;
        // Compute a POSIX relative folder like "2025/09"
        let relDir = path.relative(media_storage_1.uploadRoot, destAbs).replace(/\\/g, '/');
        // Remove any accidental leading "uploads/" segments just in case
        relDir = relDir.replace(/^\/?(?:uploads\/)+/i, '');
        // Build a single, normalized URL: "/uploads/2025/09/filename.ext"
        const urlPath = path.posix.join('/uploads', relDir, file.filename);
        return this.prisma.mediaAsset.create({
            data: {
                url: urlPath, // <-- no duplication
                filename: file.originalname || file.filename,
                mimeType: file.mimetype,
                sizeBytes: file.size,
            },
        });
    }
};
exports.MediaService = MediaService;
exports.MediaService = MediaService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], MediaService);
//# sourceMappingURL=media.service.js.map
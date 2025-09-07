"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.mediaStorage = exports.uploadRoot = void 0;
exports.ensureUploadsRoot = ensureUploadsRoot;
const multer_1 = require("multer");
const fs = require("fs");
const path = require("path");
exports.uploadRoot = path.join(process.cwd(), 'uploads');
function ensureDir(p) {
    if (!fs.existsSync(p))
        fs.mkdirSync(p, { recursive: true });
}
function ensureUploadsRoot() { ensureDir(exports.uploadRoot); }
// year/month subfolders like WordPress: /uploads/2025/09
function subdir() {
    const d = new Date();
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const dir = path.join(exports.uploadRoot, `${y}`, `${m}`);
    ensureDir(dir);
    return dir;
}
exports.mediaStorage = (0, multer_1.diskStorage)({
    destination: (_req, _file, cb) => cb(null, subdir()),
    filename: (_req, file, cb) => {
        const ext = path.extname(file.originalname) || '';
        const base = path.basename(file.originalname, ext).replace(/\s+/g, '-').toLowerCase();
        cb(null, `${base}-${Date.now()}${ext}`);
    },
});
//# sourceMappingURL=media.storage.js.map
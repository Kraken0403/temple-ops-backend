"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/* eslint-disable no-console */
const client_1 = require("@prisma/client");
const fs = require("fs/promises");
const path = require("path");
const prisma = new client_1.PrismaClient();
const VALID = new Set(['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg', '.bmp', '.tiff']);
async function walk(dir, acc = []) {
    const entries = await fs.readdir(dir, { withFileTypes: true });
    for (const e of entries) {
        const full = path.join(dir, e.name);
        if (e.isDirectory())
            await walk(full, acc);
        else
            acc.push(full);
    }
    return acc;
}
function guessMime(ext) {
    switch (ext) {
        case '.svg': return 'image/svg+xml';
        case '.png': return 'image/png';
        case '.gif': return 'image/gif';
        case '.webp': return 'image/webp';
        case '.bmp': return 'image/bmp';
        case '.tiff': return 'image/tiff';
        default: return 'image/jpeg';
    }
}
async function main() {
    const root = path.join(process.cwd(), 'uploads'); // <- must match ServeStatic root
    try {
        await fs.access(root);
    }
    catch {
        console.error('Uploads folder not found at:', root);
        process.exit(1);
    }
    const files = (await walk(root)).filter(f => VALID.has(path.extname(f).toLowerCase()));
    let created = 0, skipped = 0;
    for (const abs of files) {
        const relPath = abs.replace(root, '').replace(/\\/g, '/');
        const relUrl = `/uploads${relPath}`; // how your app serves the file
        const exists = await prisma.mediaAsset.findUnique({ where: { url: relUrl } });
        if (exists) {
            skipped++;
            continue;
        }
        const stat = await fs.stat(abs);
        const ext = path.extname(abs).toLowerCase();
        await prisma.mediaAsset.create({
            data: {
                url: relUrl,
                filename: path.basename(abs),
                mimeType: guessMime(ext),
                sizeBytes: stat.size,
            },
        });
        created++;
    }
    console.log(`Indexed ${created} file(s). Skipped ${skipped}.`);
}
main()
    .catch(e => { console.error(e); process.exit(1); })
    .finally(() => prisma.$disconnect());
//# sourceMappingURL=index-uploads-to-media.js.map
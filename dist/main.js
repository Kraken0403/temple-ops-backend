"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// src/main.ts
const common_1 = require("@nestjs/common");
const core_1 = require("@nestjs/core");
const app_module_1 = require("./app.module");
const path = require("path");
const express = require("express");
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    app.setGlobalPrefix('api/v1');
    const uploadsDir = path.resolve(process.cwd(), 'uploads');
    const allowedOrigins = new Set([
        // Production
        'https://sanatanmandirtampa.org',
        'https://www.sanatanmandirtampa.org',
        // (Optional) admin panel / future
        'https://admin.sanatanmandirtampa.org',
        'http://localhost:3001',
        'http://127.0.0.1:3001',
        'http://127.0.0.1:3003', 'http://localhost:3003'
    ]);
    /* -----------------------------
       GLOBAL CORS (API)
    ----------------------------- */
    app.enableCors({
        origin: (origin, callback) => {
            // Allow server-to-server, curl, health checks
            if (!origin)
                return callback(null, true);
            if (allowedOrigins.has(origin)) {
                return callback(null, true);
            }
            return callback(new Error(`CORS blocked for origin: ${origin}`), false);
        },
        methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Accept', 'Authorization', 'Range'],
        exposedHeaders: ['Content-Length', 'Content-Range'],
        credentials: false,
    });
    // --- Global CORS for API routes ---
    // --- CORS + headers for static /uploads (pdf.js needs these) ---
    const staticCors = (req, res, next) => {
        const origin = req.headers.origin;
        if (origin && allowedOrigins.has(origin)) {
            res.setHeader('Access-Control-Allow-Origin', origin);
            res.setHeader('Vary', 'Origin');
        }
        res.setHeader('Access-Control-Allow-Methods', 'GET, HEAD, OPTIONS');
        res.setHeader('Access-Control-Allow-Headers', 'Range');
        res.setHeader('Access-Control-Expose-Headers', 'Content-Length, Content-Range');
        res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
        if (req.method === 'OPTIONS') {
            res.sendStatus(204);
            return;
        }
        next();
    };
    const staticOpts = {
        setHeaders: (res, filePath, _stat) => {
            res.setHeader('Accept-Ranges', 'bytes');
            if (path.extname(filePath).toLowerCase() === '.pdf') {
                res.setHeader('Content-Type', 'application/pdf');
            }
        },
    };
    // Serve uploads at both routes
    app.use('/uploads', staticCors, express.static(uploadsDir, staticOpts));
    app.use('/api/v1/uploads', staticCors, express.static(uploadsDir, staticOpts));
    app.useGlobalPipes(new common_1.ValidationPipe({
        transform: true,
        whitelist: true,
        forbidNonWhitelisted: true,
    }));
    await app.listen(process.env.PORT || 3000);
}
bootstrap();
//# sourceMappingURL=main.js.map
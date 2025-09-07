"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// src/main.ts
const common_1 = require("@nestjs/common");
const core_1 = require("@nestjs/core");
const app_module_1 = require("./app.module");
const express = require("express");
const path = require("path");
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));
    // <-- ADD THIS BLOCK -->
    app.enableCors({
        // origin: 'http://localhost:3001',      // your Nuxt front-end
        origin: '*', // your Nuxt front-end
        methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
        allowedHeaders: 'Content-Type, Accept, Authorization',
        credentials: true,
    });
    // <-- END CORS SETUP -->
    app.useGlobalPipes(new common_1.ValidationPipe({
        transform: true,
        whitelist: true,
        forbidNonWhitelisted: true,
    }));
    // await app.listen(3000);
    await app.listen(3000);
    console.log('listening on 3000');
}
bootstrap();
//# sourceMappingURL=main.js.map
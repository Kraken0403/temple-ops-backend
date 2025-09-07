// src/main.ts
import { ValidationPipe } from '@nestjs/common';
import { NestFactory }    from '@nestjs/core';
import { AppModule }      from './app.module';
import * as express from 'express'
import * as path from 'path'


async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')))
  // <-- ADD THIS BLOCK -->
  app.enableCors({
    // origin: 'http://localhost:3001',      // your Nuxt front-end
    origin: '*',      // your Nuxt front-end
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    allowedHeaders: 'Content-Type, Accept, Authorization',
    credentials: true,
  });
  // <-- END CORS SETUP -->

  app.useGlobalPipes(new ValidationPipe({
    transform: true,
    whitelist: true,
    forbidNonWhitelisted: true,
  }));

  // await app.listen(3000);
  await app.listen(process.env.PORT || 3000);
  console.log(`🚀 Backend running on port ${process.env.PORT || 3000}`);
}
bootstrap();

// src/main.ts
import { ValidationPipe } from '@nestjs/common'
import { NestFactory } from '@nestjs/core'
import { AppModule } from './app.module'
import { NestExpressApplication } from '@nestjs/platform-express'
import * as path from 'path'
import * as express from 'express'
import type { ServeStaticOptions } from 'serve-static'

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule)
  app.setGlobalPrefix('api/v1')

  const uploadsDir = path.resolve(process.cwd(), 'uploads')

  // --- Global CORS for API routes ---
  app.enableCors({
    origin: ['http://localhost:3001', 'http://127.0.0.1:3001'],
    methods: ['GET','HEAD','PUT','PATCH','POST','DELETE','OPTIONS'],
    allowedHeaders: ['Content-Type','Accept','Authorization','Range'],
    exposedHeaders: ['Content-Length','Content-Range'],
    credentials: false, // don't mix * with credentials
  })

  // --- CORS + headers for static /uploads (pdf.js needs these) ---
  const staticCors: express.RequestHandler = (req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', 'http://localhost:3001')
    res.setHeader('Access-Control-Allow-Methods', 'GET, HEAD, OPTIONS')
    res.setHeader('Access-Control-Allow-Headers', 'Range')
    res.setHeader('Access-Control-Expose-Headers', 'Content-Length, Content-Range')
    res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin')
    if (req.method === 'OPTIONS') { res.sendStatus(204); return }
    next()
  }

  const staticOpts: ServeStaticOptions<express.Response> = {
    setHeaders: (res, filePath, _stat) => {
      res.setHeader('Accept-Ranges', 'bytes')
      if (path.extname(filePath).toLowerCase() === '.pdf') {
        res.setHeader('Content-Type', 'application/pdf')
      }
    },
  }

  // Serve uploads at both routes
  app.use('/uploads', staticCors, express.static(uploadsDir, staticOpts))
  app.use('/api/v1/uploads', staticCors, express.static(uploadsDir, staticOpts))

  app.useGlobalPipes(new ValidationPipe({
    transform: true,
    whitelist: true,
    forbidNonWhitelisted: true,
  }))

  await app.listen(process.env.PORT || 3000)
}
bootstrap()

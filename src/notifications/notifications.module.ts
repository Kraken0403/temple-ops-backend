// src/notifications/notifications.module.ts
import { Module } from '@nestjs/common'
import { MailerModule } from '@nestjs-modules/mailer'
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter'
import { join } from 'path'
import { NotificationsService } from './notifications.service'
import { PrismaService } from '../prisma.service'

// resolve template directory: src/notifications/templates
function resolveMailDirs() {
  return join(process.cwd(), 'dist', 'notifications', 'templates')
}

@Module({
  imports: [
    MailerModule.forRootAsync({
      useFactory: () => {
        const templatesDir = resolveMailDirs()

        return {
          transport: {
            host: process.env.MAIL_HOST,
            port: Number(process.env.MAIL_PORT) || 587,
            secure: false, // true for 465, false for other ports like 587
            auth: {
              user: process.env.MAIL_USER,
              pass: process.env.MAIL_PASS,
            },
          },
          defaults: {
            from: process.env.MAIL_FROM || '"Sanatan Mandir" <no-reply@sanatanmandir.org>',
          },
          template: {
            dir: templatesDir,
            adapter: new HandlebarsAdapter(), // loads from dist/notifications/templates/*
            options: {
              strict: false,
            },
          },
        }
      },
    }),
  ],
  providers: [NotificationsService, PrismaService],
  exports: [NotificationsService],
})
export class NotificationsModule {}

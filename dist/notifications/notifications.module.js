"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationsModule = void 0;
// src/notifications/notifications.module.ts
const common_1 = require("@nestjs/common");
const mailer_1 = require("@nestjs-modules/mailer");
const handlebars_adapter_1 = require("@nestjs-modules/mailer/dist/adapters/handlebars.adapter");
const path_1 = require("path");
const notifications_service_1 = require("./notifications.service");
const prisma_service_1 = require("../prisma.service");
// resolve template directory: src/notifications/templates
function resolveMailDirs() {
    return (0, path_1.join)(process.cwd(), 'dist', 'notifications', 'templates');
}
let NotificationsModule = class NotificationsModule {
};
exports.NotificationsModule = NotificationsModule;
exports.NotificationsModule = NotificationsModule = __decorate([
    (0, common_1.Module)({
        imports: [
            mailer_1.MailerModule.forRootAsync({
                useFactory: () => {
                    const templatesDir = resolveMailDirs();
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
                            adapter: new handlebars_adapter_1.HandlebarsAdapter(), // loads from dist/notifications/templates/*
                            options: {
                                strict: false,
                            },
                        },
                    };
                },
            }),
        ],
        providers: [notifications_service_1.NotificationsService, prisma_service_1.PrismaService],
        exports: [notifications_service_1.NotificationsService],
    })
], NotificationsModule);
//# sourceMappingURL=notifications.module.js.map
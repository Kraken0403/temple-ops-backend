"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.StaticPagesModule = void 0;
const common_1 = require("@nestjs/common");
const static_pages_controller_1 = require("./static-pages.controller");
const static_pages_service_1 = require("./static-pages.service");
const prisma_service_1 = require("../prisma.service");
let StaticPagesModule = class StaticPagesModule {
};
exports.StaticPagesModule = StaticPagesModule;
exports.StaticPagesModule = StaticPagesModule = __decorate([
    (0, common_1.Module)({
        controllers: [static_pages_controller_1.StaticPagesController],
        providers: [static_pages_service_1.StaticPagesService, prisma_service_1.PrismaService],
    })
], StaticPagesModule);
//# sourceMappingURL=static-pages.module.js.map
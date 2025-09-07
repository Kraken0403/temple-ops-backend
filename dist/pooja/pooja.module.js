"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PoojaModule = void 0;
// src/pooja/pooja.module.ts
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma.service");
const pooja_service_1 = require("./pooja.service");
const pooja_controller_1 = require("./pooja.controller");
let PoojaModule = class PoojaModule {
};
exports.PoojaModule = PoojaModule;
exports.PoojaModule = PoojaModule = __decorate([
    (0, common_1.Module)({
        controllers: [pooja_controller_1.PoojaController],
        providers: [pooja_service_1.PoojaService, prisma_service_1.PrismaService],
    })
], PoojaModule);
//# sourceMappingURL=pooja.module.js.map
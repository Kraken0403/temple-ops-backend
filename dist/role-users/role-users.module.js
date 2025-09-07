"use strict";
// src/role-users/role-users.module.ts
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RoleUsersModule = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma.service");
const role_users_controller_1 = require("./role-users.controller");
const role_users_service_1 = require("./role-users.service");
let RoleUsersModule = class RoleUsersModule {
};
exports.RoleUsersModule = RoleUsersModule;
exports.RoleUsersModule = RoleUsersModule = __decorate([
    (0, common_1.Module)({
        controllers: [role_users_controller_1.RoleUsersController],
        providers: [role_users_service_1.RoleUsersService, prisma_service_1.PrismaService],
        exports: [role_users_service_1.RoleUsersService],
    })
], RoleUsersModule);
//# sourceMappingURL=role-users.module.js.map
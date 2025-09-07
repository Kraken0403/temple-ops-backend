"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RolesService = void 0;
// src/roles/roles.service.ts
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma.service");
let RolesService = class RolesService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    findAll() {
        return this.prisma.role.findMany();
    }
    findOne(id) {
        return this.prisma.role.findUnique({ where: { id } });
    }
    create(dto) {
        return this.prisma.role.create({ data: dto });
    }
    async update(id, dto) {
        const existing = await this.prisma.role.findUnique({ where: { id } });
        if (!existing)
            throw new common_1.NotFoundException(`Role ${id} not found`);
        // block renaming the admin role or renaming *to* admin
        if (existing.name.toLowerCase() === 'admin') {
            throw new common_1.BadRequestException('The "admin" role cannot be renamed.');
        }
        if (dto.name && dto.name.toLowerCase() === 'admin') {
            throw new common_1.BadRequestException('Cannot rename a role to "admin".');
        }
        return this.prisma.role.update({ where: { id }, data: dto });
    }
    async remove(id) {
        const r = await this.prisma.role.findUnique({ where: { id } });
        if (!r)
            throw new common_1.NotFoundException(`Role ${id} not found`);
        return this.prisma.role.delete({ where: { id } });
    }
};
exports.RolesService = RolesService;
exports.RolesService = RolesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], RolesService);
//# sourceMappingURL=roles.service.js.map
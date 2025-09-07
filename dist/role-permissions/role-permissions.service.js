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
exports.RolePermissionsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma.service");
let RolePermissionsService = class RolePermissionsService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async assign(roleId, permissionIds) {
        // remove any existing duplicates first (optional)
        await this.prisma.rolePermission.deleteMany({ where: { roleId } });
        return this.prisma.$transaction(permissionIds.map(pid => this.prisma.rolePermission.create({
            data: { roleId, permissionId: pid },
        })));
    }
    async findByRole(roleId) {
        const rps = await this.prisma.rolePermission.findMany({
            where: { roleId },
            include: { permission: true },
        });
        return rps.map(rp => rp.permission);
    }
    async remove(roleId, permissionId) {
        await this.prisma.rolePermission.delete({
            where: { roleId_permissionId: { roleId, permissionId } },
        });
    }
};
exports.RolePermissionsService = RolePermissionsService;
exports.RolePermissionsService = RolePermissionsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], RolePermissionsService);
//# sourceMappingURL=role-permissions.service.js.map
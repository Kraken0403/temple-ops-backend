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
exports.RoleUsersService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma.service");
let RoleUsersService = class RoleUsersService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    /** list all users in a role */
    async findByRole(roleId) {
        return this.prisma.userRole.findMany({
            where: { roleId },
            include: { user: true },
        });
    }
    /** assign a user into a role */
    async assign(roleId, userId) {
        // optional: verify both exist
        await this.ensureRole(roleId);
        await this.ensureUser(userId);
        return this.prisma.userRole.create({
            data: { roleId, userId },
            include: { user: true },
        });
    }
    /** unassign */
    async remove(roleId, userId) {
        await this.prisma.userRole.delete({
            where: { userId_roleId: { roleId, userId } },
        });
        return { removed: true };
    }
    async ensureRole(id) {
        const r = await this.prisma.role.findUnique({ where: { id } });
        if (!r)
            throw new common_1.NotFoundException(`Role ${id} not found`);
    }
    async ensureUser(id) {
        const u = await this.prisma.user.findUnique({ where: { id } });
        if (!u)
            throw new common_1.NotFoundException(`User ${id} not found`);
    }
};
exports.RoleUsersService = RoleUsersService;
exports.RoleUsersService = RoleUsersService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], RoleUsersService);
//# sourceMappingURL=role-users.service.js.map
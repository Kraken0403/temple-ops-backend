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
exports.PermissionsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma.service");
const client_1 = require("@prisma/client");
let PermissionsService = class PermissionsService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    /**
     * Create a new permission, or return the existing one if the name is already taken
     */
    async create(dto) {
        try {
            return await this.prisma.permission.create({ data: dto });
        }
        catch (e) {
            if (e instanceof client_1.Prisma.PrismaClientKnownRequestError &&
                e.code === 'P2002' &&
                e.meta?.target === 'Permission_name_key') {
                // Unique constraint failed on Permission.name → fetch and return existing
                return this.prisma.permission.findUniqueOrThrow({
                    where: { name: dto.name },
                });
            }
            throw e;
        }
    }
    findAll() {
        return this.prisma.permission.findMany();
    }
    async findOne(id) {
        const p = await this.prisma.permission.findUnique({ where: { id } });
        if (!p)
            throw new common_1.NotFoundException(`Permission ${id} not found`);
        return p;
    }
    async update(id, dto) {
        await this.findOne(id);
        return this.prisma.permission.update({ where: { id }, data: dto });
    }
    async remove(id) {
        await this.findOne(id);
        return this.prisma.permission.delete({ where: { id } });
    }
};
exports.PermissionsService = PermissionsService;
exports.PermissionsService = PermissionsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], PermissionsService);
//# sourceMappingURL=permissions.service.js.map
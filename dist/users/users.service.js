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
exports.UsersService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma.service");
const bcrypt = require("bcrypt");
let UsersService = class UsersService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findAll() {
        return this.prisma.user.findMany({ include: { roles: { include: { role: true } } } });
    }
    async findOne(id) {
        return this.prisma.user.findUnique({
            where: { id },
            include: { roles: { include: { role: true } } }
        });
    }
    async create(dto) {
        const hash = await bcrypt.hash(dto.password, 10);
        return this.prisma.user.create({
            data: {
                email: dto.email,
                password: hash,
                roles: {
                    create: dto.roles.map(roleId => ({ role: { connect: { id: roleId } } }))
                }
            },
            include: { roles: { include: { role: true } } }
        });
    }
    async update(id, dto) {
        await this.ensureExists(id);
        const data = { email: dto.email };
        if (dto.password)
            data.password = await bcrypt.hash(dto.password, 10);
        if (dto.roles) {
            data.roles = {
                deleteMany: {}, // clear existing
                create: dto.roles.map(rid => ({ role: { connect: { id: rid } } }))
            };
        }
        return this.prisma.user.update({
            where: { id },
            data,
            include: { roles: { include: { role: true } } }
        });
    }
    async remove(id) {
        await this.ensureExists(id);
        return this.prisma.user.delete({ where: { id } });
    }
    async ensureExists(id) {
        const u = await this.prisma.user.findUnique({ where: { id } });
        if (!u)
            throw new common_1.NotFoundException(`User ${id} not found`);
    }
};
exports.UsersService = UsersService;
exports.UsersService = UsersService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], UsersService);
//# sourceMappingURL=users.service.js.map
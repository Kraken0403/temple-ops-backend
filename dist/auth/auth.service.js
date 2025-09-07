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
exports.AuthService = void 0;
// src/auth/auth.service.ts
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma.service");
const jwt_1 = require("@nestjs/jwt");
const bcrypt = require("bcrypt");
let AuthService = class AuthService {
    constructor(prisma, jwt) {
        this.prisma = prisma;
        this.jwt = jwt;
    }
    /** Validate credentials for LocalStrategy */
    async validateUser(email, pass) {
        const user = await this.prisma.user.findUnique({
            where: { email },
            include: {
                // pull in the pivot rows _and_ the related Role record
                roles: { include: { role: true } }
            }
        });
        if (!user)
            return null;
        if (!(await bcrypt.compare(pass, user.password)))
            return null;
        return {
            id: user.id,
            email: user.email,
            roles: user.roles.map(r => r.role.name),
        };
    }
    /** Signup a new user (assign "user" role) and return JWT */
    async signup(dto) {
        const hashed = await bcrypt.hash(dto.password, 10);
        let user;
        try {
            user = await this.prisma.user.create({
                data: {
                    email: dto.email,
                    password: hashed,
                    roles: {
                        // create a pivot row whose nested `role` is connectOrCreate’d
                        create: [
                            {
                                role: {
                                    connectOrCreate: {
                                        where: { name: 'user' },
                                        create: { name: 'user' }
                                    }
                                }
                            }
                        ]
                    }
                },
                include: {
                    roles: { include: { role: true } }
                }
            });
        }
        catch (e) {
            if (e.code === 'P2002') {
                throw new common_1.BadRequestException('Email already in use');
            }
            throw e;
        }
        const jwtUser = {
            id: user.id,
            email: user.email,
            roles: user.roles.map(r => r.role.name),
        };
        const token = this.getToken(jwtUser);
        return { access_token: token };
    }
    /** Login returns JWT for an already-validated user */
    async login(user) {
        // If you need to re-fetch roles from DB, do so here.
        return { access_token: this.getToken(user) };
    }
    /** Helper: signs a JWT from JwtUser */
    getToken(user) {
        const payload = { sub: user.id, email: user.email, roles: user.roles };
        return this.jwt.sign(payload, { expiresIn: process.env.JWT_EXPIRES_IN });
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        jwt_1.JwtService])
], AuthService);
//# sourceMappingURL=auth.service.js.map
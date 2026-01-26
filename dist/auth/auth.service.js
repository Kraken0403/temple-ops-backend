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
    /* ───────────────────────── Validate (LocalStrategy) ───────────────────────── */
    /** Validate credentials for LocalStrategy */
    async validateUser(email, pass) {
        const user = await this.prisma.user.findUnique({
            where: { email },
            include: {
                roles: { include: { role: true } }, // UserRole[] -> Role
            },
        });
        if (!user)
            return null;
        const ok = await bcrypt.compare(pass, user.password);
        if (!ok)
            return null;
        const roleNames = (user.roles || [])
            .map((r) => r.role?.name)
            .filter(Boolean);
        return {
            id: user.id,
            email: user.email,
            roles: roleNames,
            priestId: user.priestId ?? null,
        };
    }
    /* ─────────────────────────────── Signup ─────────────────────────────── */
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
                        create: [
                            {
                                role: {
                                    connectOrCreate: {
                                        where: { name: 'user' },
                                        create: { name: 'user' },
                                    },
                                },
                            },
                        ],
                    },
                },
                include: { roles: { include: { role: true } } },
            });
        }
        catch (e) {
            if (e?.code === 'P2002') {
                throw new common_1.BadRequestException('Email already in use');
            }
            throw e;
        }
        const roleNames = (user.roles || [])
            .map((r) => r.role?.name)
            .filter(Boolean);
        const jwtUser = {
            id: user.id,
            email: user.email,
            roles: roleNames,
            priestId: user.priestId ?? null, // usually null on signup
        };
        const token = this.signToken(jwtUser);
        return { access_token: token };
    }
    /* ─────────────────────────────── Login ─────────────────────────────── */
    /**
     * Login returns JWT for an already-validated user.
     * We re-fetch from DB to ensure we always include up-to-date roles & priestId
     * (in case LocalStrategy’s user payload is stale/minimal).
     */
    async login(user) {
        const dbUser = await this.prisma.user.findUnique({
            where: { id: user.id },
            include: { roles: { include: { role: true } } },
        });
        if (!dbUser)
            throw new common_1.UnauthorizedException();
        const roleNames = (dbUser.roles || [])
            .map((r) => r.role?.name)
            .filter(Boolean);
        const jwtUser = {
            id: dbUser.id,
            email: dbUser.email,
            roles: roleNames,
            priestId: dbUser.priestId ?? null,
        };
        return { access_token: this.signToken(jwtUser) };
    }
    /* ───────────────────────────── Helper ───────────────────────────── */
    /** Helper: sign a JWT from JwtUser (includes priestId for priest-only routes) */
    signToken(user) {
        const payload = {
            sub: user.id,
            email: user.email,
            roles: user.roles, // e.g., ['Admin'] | ['Priest'] | ['user']
            priestId: user.priestId, // number | null
        };
        const expiresIn = process.env.JWT_EXPIRES_IN || '7d';
        return this.jwt.sign(payload, { expiresIn });
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        jwt_1.JwtService])
], AuthService);
//# sourceMappingURL=auth.service.js.map
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
exports.SettingsService = void 0;
// src/settings/settings.service.ts
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma.service");
let SettingsService = class SettingsService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getSettings() {
        const settings = await this.prisma.settings.findUnique({
            where: { id: 1 },
            include: {
                primaryVenue: true, // ✅ allow frontend & booking service to see it
            },
        });
        // If settings row doesn't exist, return safe defaults
        if (!settings) {
            return {
                currency: 'USD',
                timezone: 'America/New_York',
                travelRate: 10,
                travelUnit: 'mile',
                freeTravelUnits: 5,
                maxServiceUnits: 50,
                travelAvgSpeed: 25,
                primaryVenueId: null, // ✅ important
                primaryVenue: null, // ✅ safe default
            };
        }
        return settings;
    }
    async updateSettings(data) {
        const existing = await this.prisma.settings.findUnique({
            where: { id: 1 },
        });
        if (existing) {
            return this.prisma.settings.update({
                where: { id: 1 },
                data,
            });
        }
        // Create initial settings row (REQUIRED FIELDS INCLUDED)
        return this.prisma.settings.create({
            data: {
                id: 1,
                currency: data.currency ?? 'USD',
                timezone: data.timezone ?? 'America/New_York',
                travelRate: data.travelRate ?? 10,
                travelUnit: data.travelUnit ?? 'mile',
                freeTravelUnits: data.freeTravelUnits ?? 5,
                maxServiceUnits: data.maxServiceUnits ?? 50,
                travelAvgSpeed: data.travelAvgSpeed ?? 25,
                primaryVenueId: data.primaryVenueId ?? null, // ✅ ADD
            },
        });
    }
};
exports.SettingsService = SettingsService;
exports.SettingsService = SettingsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], SettingsService);
//# sourceMappingURL=settings.service.js.map